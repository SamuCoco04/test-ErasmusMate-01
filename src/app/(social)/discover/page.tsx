"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBlockUserMutation, useConnectionsQuery, useDiscoverProfilesQuery, useReportEntityMutation, useSendConnectionRequestMutation } from "@/lib/query/social-hooks";

const ACTOR_PROFILE_ID = "ME-STUDENT";

type DiscoverProfile = {
  id: string;
  name: string;
  homeInstitution?: string;
  destinationCity?: string;
};

type Connection = {
  id: string;
  peerProfileId?: string;
  requesterProfileId?: string;
  recipientProfileId?: string;
  state: string;
};

export default function DiscoverPage() {
  const discoverQuery = useDiscoverProfilesQuery(ACTOR_PROFILE_ID);
  const connectionsQuery = useConnectionsQuery(ACTOR_PROFILE_ID);
  const requestMutation = useSendConnectionRequestMutation();
  const blockMutation = useBlockUserMutation();
  const reportMutation = useReportEntityMutation();

  const discoverableProfiles = (discoverQuery.data as DiscoverProfile[] | undefined) ?? [];
  const rawConnections = (connectionsQuery.data as Connection[] | undefined) ?? [];

  // Normalize connections: derive peerProfileId from requester/recipient when absent (API shape)
  const connections = rawConnections.map((connection) => ({
    ...connection,
    peerProfileId:
      connection.peerProfileId
      ?? (connection.requesterProfileId === ACTOR_PROFILE_ID
        ? connection.recipientProfileId
        : connection.requesterProfileId),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Discover Students</h1>
        <p className="text-muted-foreground">Social-support discovery is consent-based and separate from institutional procedures.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consent and Visibility Rules</CardTitle>
          <CardDescription>
            Profiles are shown only when discoverability consent is enabled in Erasmus social scope.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {discoverableProfiles.length === 0 ? (
            <p className="text-muted-foreground">No discoverable profiles available.</p>
          ) : (
            discoverableProfiles.map((profile) => {
              const activeConnection = connections
                .filter((connection) => connection.peerProfileId === profile.id)
                .sort((a, b) => {
                  const aTime = (a as { createdAt?: string; initiatedAt?: string }).createdAt ?? (a as { createdAt?: string; initiatedAt?: string }).initiatedAt ?? a.id;
                  const bTime = (b as { createdAt?: string; initiatedAt?: string }).createdAt ?? (b as { createdAt?: string; initiatedAt?: string }).initiatedAt ?? b.id;
                  return bTime.localeCompare(aTime);
                })[0];

              return (
                <div key={profile.id} className="space-y-3 rounded-md border bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{profile.name}</p>
                      <p className="text-muted-foreground">{profile.homeInstitution ?? "Institution not available"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="default">Discoverable</Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground">Destination: {profile.destinationCity ?? "Destination not available"}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={requestMutation.isPending || activeConnection?.state === "pending" || activeConnection?.state === "accepted" || activeConnection?.state === "blocked"}
                      onClick={() => requestMutation.mutate(profile.id)}
                    >
                      {activeConnection?.state === "blocked"
                        ? "Blocked"
                        : activeConnection?.state === "pending"
                          ? "Request pending"
                          : activeConnection?.state === "accepted"
                            ? "Connected"
                            : "Request connection"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reportMutation.mutate({ targetType: "social_profile", targetId: profile.id, reason: "User report from discover page" })}
                    >
                      Report
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => blockMutation.mutate({ peerId: profile.id, reason: "Blocked from discover page" })}
                    >
                      Block
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

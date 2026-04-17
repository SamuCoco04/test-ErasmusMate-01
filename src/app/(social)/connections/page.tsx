"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAcceptConnectionMutation, useBlockUserMutation, useCancelConnectionMutation, useConnectionsQuery, useRejectConnectionMutation, useReportEntityMutation } from "@/lib/query/social-hooks";

const ACTOR_PROFILE_ID = "ME-STUDENT";

type Connection = {
  id: string;
  peerProfileId?: string;
  peerName?: string;
  state: string;
  direction?: string;
  initiatedAt?: string;
  createdAt?: string;
  requesterProfileId?: string;
  recipientProfileId?: string;
  requester?: { displayName?: string };
  recipient?: { displayName?: string };
};

export default function ConnectionsPage() {
  const connectionsQuery = useConnectionsQuery(ACTOR_PROFILE_ID);
  const acceptMutation = useAcceptConnectionMutation();
  const rejectMutation = useRejectConnectionMutation();
  const blockMutation = useBlockUserMutation();
  const reportMutation = useReportEntityMutation();
  const cancelMutation = useCancelConnectionMutation();

  const connections = ((connectionsQuery.data as Connection[] | undefined) ?? []).map((connection) => {
    const inferredPeerName =
      connection.peerName
      ?? (connection.requesterProfileId === ACTOR_PROFILE_ID ? connection.recipient?.displayName : connection.requester?.displayName)
      ?? "Peer";

    const inferredDirection =
      connection.direction
      ?? (connection.recipientProfileId === ACTOR_PROFILE_ID
        ? "incoming"
        : connection.requesterProfileId === ACTOR_PROFILE_ID
          ? "outgoing"
          : "outgoing");

    // Derive peerProfileId from requester/recipient if not present (API shape)
    const peerProfileId =
      connection.peerProfileId
      ?? (connection.requesterProfileId === ACTOR_PROFILE_ID
        ? connection.recipientProfileId
        : connection.requesterProfileId)
      ?? "";

    return {
      ...connection,
      peerName: inferredPeerName,
      peerProfileId,
      direction: inferredDirection,
      initiatedAt: connection.initiatedAt ?? connection.createdAt ?? undefined,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Connections</h1>
        <p className="text-muted-foreground">Connection lifecycle states are API-backed and remain secondary to official procedures.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection State Matrix</CardTitle>
          <CardDescription>Messaging is enabled only after an accepted connection and remains disabled for all other states.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {connections.map((connection) => {
            const canMessage = connection.state === "accepted";
            const isIncomingPending = connection.state === "pending" && connection.direction === "incoming";
            const isOutgoingPending = connection.state === "pending" && connection.direction === "outgoing";
            const isRestricted = connection.state === "blocked" || connection.state === "closed";

            return (
              <div key={connection.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-white p-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{connection.peerName}</p>
                  <p className="text-muted-foreground">Initiated: {connection.initiatedAt ?? "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={canMessage ? "default" : "secondary"}>{connection.state}</Badge>
                  {isIncomingPending && (
                    <>
                      <Button size="sm" onClick={() => acceptMutation.mutate({ connectionId: connection.id, actorProfileId: ACTOR_PROFILE_ID })}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate({ connectionId: connection.id, actorProfileId: ACTOR_PROFILE_ID })}>
                        Reject
                      </Button>
                    </>
                  )}
                  {isOutgoingPending && (
                    <Button size="sm" variant="outline" onClick={() => cancelMutation.mutate({ connectionId: connection.id, actorProfileId: ACTOR_PROFILE_ID })}>
                      Cancel request
                    </Button>
                  )}
                  <Button size="sm" disabled={!canMessage}>
                    Message
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isRestricted}
                    onClick={() =>
                      reportMutation.mutate({
                        reporterProfileId: ACTOR_PROFILE_ID,
                        targetType: "social_interaction",
                        targetId: connection.id,
                        reason: "Connection reported from connections page",
                      })
                    }
                  >
                    Report
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => blockMutation.mutate({ connectionId: connection.id, actorProfileId: ACTOR_PROFILE_ID, reason: "Blocked from connection page" })}>
                    Block
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

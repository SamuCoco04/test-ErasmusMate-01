"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { socialProfiles } from "@/lib/mock/social-support";
import { socialService } from "@/lib/services/social-service";
import { useSocialStore } from "@/lib/state/social-store";

export default function DiscoverPage() {
  const connections = useSocialStore((snapshot) => snapshot.connections);

  const discoverableProfiles = socialProfiles.filter(
    (profile) => profile.consent.discoverabilityConsent && !profile.consent.consentRevokedAt && profile.visibility.profileVisibility === "erasmus_scope",
  );

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
            Profiles are shown only when discoverability consent is enabled, consent has not been revoked, and visibility is set to Erasmus-scope.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {discoverableProfiles.length === 0 ? (
            <p className="text-muted-foreground">No discoverable profiles available.</p>
          ) : (
            discoverableProfiles.map((profile) => {
              const contactable = profile.consent.contactabilityConsent && profile.visibility.directContactExposed;
              const activeConnection = connections.find(
                (connection) => connection.peerProfileId === profile.id && ["pending", "accepted", "blocked"].includes(connection.state),
              );

              return (
                <div key={profile.id} className="space-y-3 rounded-md border bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{profile.name}</p>
                      <p className="text-muted-foreground">{profile.homeInstitution}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="default">Discoverable</Badge>
                      <Badge variant={contactable ? "default" : "secondary"}>{contactable ? "Contactable" : "Contact locked"}</Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground">Destination: {profile.destinationCity}</p>
                  <p className="text-muted-foreground">Interests: {profile.interests.join(", ")}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View profile
                    </Button>
                    <Button
                      size="sm"
                      disabled={!contactable || Boolean(activeConnection)}
                      onClick={() => socialService.sendConnectionRequest(profile.id)}
                    >
                      {activeConnection?.state === "pending" ? "Request pending" : activeConnection?.state === "accepted" ? "Connected" : "Request connection"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => socialService.reportEntity({ targetType: "social_profile", targetId: profile.id, reason: "User report from discover page" })}
                    >
                      Report
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => socialService.blockUser(profile.id, "Blocked from discover page")}>Block</Button>
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

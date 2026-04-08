"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBlockProfileMutation, useReportTargetMutation, useRequestConnectionMutation } from "@/lib/query/social-hooks";
import { useSocialStore } from "@/lib/state/social-store";

export default function DiscoverPage() {
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const profiles = useSocialStore((store) => store.profiles);
  const discoverableProfiles = profiles.filter(
    (p) => p.consent.discoverabilityConsent && !p.consent.consentRevokedAt && p.visibility.profileVisibility === "erasmus_scope",
  );

  const requestMutation = useRequestConnectionMutation();
  const reportMutation = useReportTargetMutation();
  const blockMutation = useBlockProfileMutation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Discover Students</h1>
        <p className="text-muted-foreground">Social-support discovery is consent-based and separate from institutional procedures.</p>
      </div>

      {banner && (
        <div className={`rounded-md border p-3 text-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {banner.message}
        </div>
      )}

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
                    <Button size="sm" variant="outline">View profile</Button>
                    <Button
                      size="sm"
                      disabled={!contactable || requestMutation.isPending}
                      onClick={async () => {
                        const result = await requestMutation.mutateAsync(profile.id).catch((error: Error) => {
                          setBanner({ type: "error", message: error.message });
                          return null;
                        });
                        if (result) setBanner({ type: "success", message: result.details });
                      }}
                    >
                      {requestMutation.isPending ? "Sending request..." : "Request connection"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={reportMutation.isPending}
                      onClick={async () => {
                        const result = await reportMutation.mutateAsync({ targetId: profile.id, reason: "profile_safety_review" }).catch((error: Error) => {
                          setBanner({ type: "error", message: error.message });
                          return null;
                        });
                        if (result) setBanner({ type: "success", message: result.details });
                      }}
                    >
                      {reportMutation.isPending ? "Reporting..." : "Report"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={blockMutation.isPending}
                      onClick={async () => {
                        const result = await blockMutation.mutateAsync(profile.id).catch((error: Error) => {
                          setBanner({ type: "error", message: error.message });
                          return null;
                        });
                        if (result) setBanner({ type: "success", message: result.details });
                      }}
                    >
                      {blockMutation.isPending ? "Blocking..." : "Block"}
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

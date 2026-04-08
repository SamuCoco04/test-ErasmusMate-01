"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { socialProfiles } from "@/lib/mock/social-support";
import { mockFetchers } from "@/lib/query/mock-fetchers";
import { useMockQueryState } from "@/lib/query/use-mock-query-state";

export default function DiscoverPage() {
  const mockState = useMockQueryState("discover");
  const { isLoading, isError, error } = useQuery({
    queryKey: ["socialOverview", "discover", mockState],
    queryFn: () => mockFetchers.socialOverview(mockState),
    retry: false,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading discover feed mock data…</p>;
  if (isError) return <p className="text-sm text-rose-700">Failed to load discover data: {(error as Error).message}</p>;

  // Only surface profiles where consent is active, not revoked, and visibility is erasmus_scope.
  // Profiles with connections_only or private visibility, or revoked consent, are excluded entirely.
  const discoverableProfiles = socialProfiles.filter(
    (p) => p.consent.discoverabilityConsent && !p.consent.consentRevokedAt && p.visibility.profileVisibility === "erasmus_scope",
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
                    <Button size="sm" disabled={!contactable}>
                      Request connection
                    </Button>
                    <Button size="sm" variant="outline">
                      Report
                    </Button>
                    <Button size="sm" variant="outline">
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { socialProfiles } from "@/lib/mock/social-support";

export default function DiscoverPage() {
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
            Profiles are shown only when discoverability consent is enabled and visibility allows Erasmus-scope discovery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {socialProfiles.map((profile) => {
            const discoverable = profile.consent.discoverabilityConsent && profile.visibility.profileVisibility !== "private";
            const contactable =
              profile.consent.contactabilityConsent && profile.visibility.directContactExposed && profile.visibility.profileVisibility !== "private";

            return (
              <div key={profile.id} className="space-y-3 rounded-md border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{profile.name}</p>
                    <p className="text-muted-foreground">{profile.homeInstitution}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={discoverable ? "default" : "secondary"}>{discoverable ? "Discoverable" : "Not discoverable"}</Badge>
                    <Badge variant={contactable ? "default" : "secondary"}>{contactable ? "Contactable" : "Contact locked"}</Badge>
                  </div>
                </div>
                <p className="text-muted-foreground">Destination: {profile.destinationCity}</p>
                <p className="text-muted-foreground">Interests: {profile.interests.join(", ")}</p>
                {profile.consent.consentRevokedAt ? (
                  <p className="text-xs text-amber-700">Consent revoked at {profile.consent.consentRevokedAt}; profile remains hidden from discovery.</p>
                ) : null}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={!discoverable}>
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
          })}
        </CardContent>
      </Card>
    </div>
  );
}

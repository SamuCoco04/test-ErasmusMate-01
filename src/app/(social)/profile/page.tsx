import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { socialProfileSettings } from "@/lib/mock/social-support";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Social Profile Settings</h1>
        <p className="text-muted-foreground">Student-controlled consent and visibility determine discoverability and contactability.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consent Controls</CardTitle>
          <CardDescription>Revoking consent immediately removes discoverability/contactability from social routes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-md border bg-white p-3">
            <span>Discoverability consent</span>
            <Badge variant={socialProfileSettings.discoverabilityConsent ? "default" : "secondary"}>
              {socialProfileSettings.discoverabilityConsent ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border bg-white p-3">
            <span>Contactability consent</span>
            <Badge variant={socialProfileSettings.contactabilityConsent ? "default" : "secondary"}>
              {socialProfileSettings.contactabilityConsent ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border bg-white p-3">
            <span>Profile visibility</span>
            <Badge variant="secondary">{socialProfileSettings.profileVisibility}</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border bg-white p-3">
            <span>Direct contact exposed</span>
            <Badge variant={socialProfileSettings.directContactExposed ? "default" : "secondary"}>
              {socialProfileSettings.directContactExposed ? "Visible" : "Hidden"}
            </Badge>
          </div>
          <div className="rounded-md border bg-white p-3">
            <p className="mb-2 font-medium text-slate-900">Blocked users</p>
            <ul className="list-inside list-disc text-muted-foreground">
              {socialProfileSettings.blockedUsers.map((user) => (
                <li key={user}>{user}</li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Update consent
            </Button>
            <Button size="sm" variant="outline">
              Update visibility
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

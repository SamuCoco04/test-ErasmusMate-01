import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { socialConnections } from "@/lib/mock/social-support";

export default function ConnectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Connections</h1>
        <p className="text-muted-foreground">All connection lifecycle states are mocked for UI coverage and policy testing.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection State Matrix</CardTitle>
          <CardDescription>Messaging is enabled only after an accepted connection and remains disabled for all other states.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {socialConnections.map((connection) => {
            const canMessage = connection.state === "accepted";
            const isRestricted = connection.state === "blocked" || connection.state === "closed";
            return (
              <div key={connection.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-white p-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{connection.peerName}</p>
                  <p className="text-muted-foreground">Initiated: {connection.initiatedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={canMessage ? "default" : "secondary"}>{connection.state}</Badge>
                  <Button size="sm" disabled={!canMessage}>
                    Message
                  </Button>
                  <Button size="sm" variant="outline" disabled={isRestricted}>
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

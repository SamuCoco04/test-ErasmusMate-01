"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { socialService } from "@/lib/services/social-service";
import { useSocialStore } from "@/lib/state/social-store";

export default function ConnectionsPage() {
  const connections = useSocialStore((snapshot) => snapshot.connections);

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
          {connections.map((connection) => {
            const canMessage = connection.state === "accepted";
            const isIncomingPending = connection.state === "pending" && connection.direction === "incoming";
            const isOutgoingPending = connection.state === "pending" && connection.direction === "outgoing";
            const isRestricted = connection.state === "blocked" || connection.state === "closed";

            return (
              <div key={connection.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-white p-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{connection.peerName}</p>
                  <p className="text-muted-foreground">Initiated: {connection.initiatedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={canMessage ? "default" : "secondary"}>{connection.state}</Badge>
                  {isIncomingPending && (
                    <>
                      <Button size="sm" onClick={() => socialService.acceptConnection(connection.id)}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => socialService.rejectConnection(connection.id)}>
                        Reject
                      </Button>
                    </>
                  )}
                  {isOutgoingPending && (
                    <Button size="sm" variant="outline" onClick={() => socialService.cancelConnection(connection.id)}>
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
                      socialService.reportEntity({
                        targetType: "social_interaction",
                        targetId: connection.id,
                        reason: "Connection reported from connections page",
                      })
                    }
                  >
                    Report
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => socialService.blockUser(connection.peerProfileId, "Blocked from connection page")}>
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

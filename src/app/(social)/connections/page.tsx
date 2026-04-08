"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBlockConnectionMutation, useReportTargetMutation } from "@/lib/query/social-hooks";
import { useSocialStore } from "@/lib/state/social-store";

export default function ConnectionsPage() {
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const connections = useSocialStore((store) => store.connections);

  const reportMutation = useReportTargetMutation();
  const blockMutation = useBlockConnectionMutation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Connections</h1>
        <p className="text-muted-foreground">All connection lifecycle states are mocked for UI coverage and policy testing.</p>
      </div>

      {banner && (
        <div className={`rounded-md border p-3 text-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{banner.message}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Connection State Matrix</CardTitle>
          <CardDescription>Messaging is enabled only after an accepted connection and remains disabled for all other states.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {connections.map((connection) => {
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
                  <Button size="sm" disabled={!canMessage}>Message</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isRestricted || reportMutation.isPending}
                    onClick={async () => {
                      const result = await reportMutation.mutateAsync({ targetId: connection.id, reason: "connection_report" }).catch((error: Error) => {
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
                      const result = await blockMutation.mutateAsync(connection.id).catch((error: Error) => {
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
          })}
        </CardContent>
      </Card>
    </div>
  );
}

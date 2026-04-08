"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBlockConnectionMutation, useReportTargetMutation, useSendMessageMutation } from "@/lib/query/social-hooks";
import { useSocialStore } from "@/lib/state/social-store";

export default function MessagesPage() {
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const threads = useSocialStore((store) => store.messageThreads);
  const connections = useSocialStore((store) => store.connections);

  const sendMutation = useSendMessageMutation();
  const reportMutation = useReportTargetMutation();
  const blockMutation = useBlockConnectionMutation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Messages</h1>
        <p className="text-muted-foreground">Direct messages are restricted to accepted connections only.</p>
      </div>

      {banner && (
        <div className={`rounded-md border p-3 text-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{banner.message}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Thread Access Control</CardTitle>
          <CardDescription>Only threads with accepted connections can send new messages; all other states are read-only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {threads.map((thread) => {
            const canSend = thread.connectionState === "accepted";
            const connection = connections.find((item) => item.peerName === thread.withUser);
            return (
              <div key={thread.id} className="space-y-2 rounded-md border bg-white p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{thread.withUser}</p>
                  <Badge variant={canSend ? "default" : "secondary"}>{thread.connectionState}</Badge>
                </div>
                <p className="text-muted-foreground">Last update: {thread.updatedAt}</p>
                <p>{thread.lastMessage}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={!canSend || sendMutation.isPending}
                    onClick={async () => {
                      const result = await sendMutation.mutateAsync({ threadId: thread.id, message: "Thanks — I received your Erasmus checklist." }).catch((error: Error) => {
                        setBanner({ type: "error", message: error.message });
                        return null;
                      });
                      if (result) setBanner({ type: "success", message: result.details });
                    }}
                  >
                    {sendMutation.isPending ? "Sending..." : "Send message"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={reportMutation.isPending}
                    onClick={async () => {
                      const result = await reportMutation.mutateAsync({ targetId: thread.id, reason: "message_report" }).catch((error: Error) => {
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
                    disabled={!connection || blockMutation.isPending}
                    onClick={async () => {
                      if (!connection) return;
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

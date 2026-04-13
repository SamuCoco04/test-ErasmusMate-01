"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { socialService } from "@/lib/services/social-service";
import { socialStore, useSocialStore } from "@/lib/state/social-store";

export default function MessagesPage() {
  const threads = useSocialStore((snapshot) => snapshot.threads);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Messages</h1>
        <p className="text-muted-foreground">Direct messages are restricted to accepted connections only.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thread Access Control</CardTitle>
          <CardDescription>Only threads with accepted connections can send new messages; all other states are read-only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {threads.map((thread) => {
            const { connectionState, reason } = socialStore.resolveThreadPermission(thread.id);
            const canSend = socialService.canSendMessageToProfile(thread.withProfileId);

            return (
              <div key={thread.id} className="space-y-2 rounded-md border bg-white p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{thread.withUser}</p>
                  <Badge variant={canSend ? "default" : "secondary"}>{connectionState}</Badge>
                </div>
                <p className="text-muted-foreground">Last update: {thread.updatedAt}</p>
                <p>{thread.lastMessage}</p>
                {canSend ? (
                  <div className="flex gap-2">
                    <Input placeholder="Type your message" className="max-w-sm" />
                    <Button size="sm">Send message</Button>
                  </div>
                ) : (
                  <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-900">{reason}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => socialService.reportEntity({ targetType: "message", targetId: thread.id, reason: "Message thread reported" })}
                  >
                    Report
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => socialService.blockUser(thread.withProfileId, `Blocked from message thread ${thread.id}`)}
                  >
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

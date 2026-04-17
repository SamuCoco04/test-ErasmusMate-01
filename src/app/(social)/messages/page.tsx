"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBlockUserMutation, useMessagesQuery, useReportEntityMutation } from "@/lib/query/social-hooks";

const ACTOR_PROFILE_ID = "ME-STUDENT";

type Thread = {
  id: string;
  withProfileId: string;
  withUser: string;
  connectionState: string;
  lastMessage: string;
  updatedAt: string;
};

function permissionReason(state: string) {
  if (state === "accepted") return "Messaging is enabled for accepted connections.";
  if (state === "pending") return "Read-only: request is still pending acceptance.";
  if (state === "rejected") return "Read-only: request was rejected.";
  if (state === "cancelled") return "Read-only: request was cancelled.";
  if (state === "blocked") return "Read-only: one side blocked this relationship.";
  if (state === "expired") return "Read-only: connection expired and messaging is retained only as history.";
  if (state === "closed") return "Read-only: connection is closed and messaging is archived.";
  return "Read-only: no accepted connection exists.";
}

export default function MessagesPage() {
  const messagesQuery = useMessagesQuery(ACTOR_PROFILE_ID);
  const reportMutation = useReportEntityMutation();
  const blockMutation = useBlockUserMutation();
  const threads = (messagesQuery.data as Thread[] | undefined) ?? [];

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
            const canSend = thread.connectionState === "accepted";

            return (
              <div key={thread.id} className="space-y-2 rounded-md border bg-white p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{thread.withUser}</p>
                  <Badge variant={canSend ? "default" : "secondary"}>{thread.connectionState}</Badge>
                </div>
                <p className="text-muted-foreground">Last update: {thread.updatedAt}</p>
                <p>{thread.lastMessage}</p>
                {canSend ? (
                  <div className="flex gap-2">
                    <Input placeholder="Type your message" className="max-w-sm" />
                    <Button size="sm">Send message</Button>
                  </div>
                ) : (
                  <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-900">{permissionReason(thread.connectionState)}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => reportMutation.mutate({ reporterProfileId: ACTOR_PROFILE_ID, targetType: "message", targetId: thread.id, reason: "Message thread reported" })}
                  >
                    Report
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => blockMutation.mutate({ connectionId: thread.id, actorProfileId: ACTOR_PROFILE_ID, reason: `Blocked from message thread ${thread.id}` })}
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

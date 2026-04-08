"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { messageThreads } from "@/lib/mock/social-support";
import { mockFetchers } from "@/lib/query/mock-fetchers";
import { useMockQueryState } from "@/lib/query/use-mock-query-state";

export default function MessagesPage() {
  const mockState = useMockQueryState("messages");
  const { isLoading, isError, error } = useQuery({
    queryKey: ["socialOverview", "messages", mockState],
    queryFn: () => mockFetchers.socialOverview(mockState),
    retry: false,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading messaging mock data…</p>;
  if (isError) return <p className="text-sm text-rose-700">Failed to load messaging data: {(error as Error).message}</p>;

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
          {messageThreads.map((thread) => {
            const canSend = thread.connectionState === "accepted";
            return (
              <div key={thread.id} className="space-y-2 rounded-md border bg-white p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{thread.withUser}</p>
                  <Badge variant={canSend ? "default" : "secondary"}>{thread.connectionState}</Badge>
                </div>
                <p className="text-muted-foreground">Last update: {thread.updatedAt}</p>
                <p>{thread.lastMessage}</p>
                <div className="flex gap-2">
                  <Button size="sm" disabled={!canSend}>
                    Send message
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

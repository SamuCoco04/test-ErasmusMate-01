import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { messageThreads } from "@/lib/mock/social-support";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Messages</h1>
        <p className="text-muted-foreground">Direct messages are restricted to accepted connections only.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thread Access Control</CardTitle>
          <CardDescription>Threads in pending, blocked, rejected, or closed states are read-only and cannot send new messages.</CardDescription>
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MessagesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Messaging UI with mocked threads. No backend calls are performed.</p>
      </CardContent>
    </Card>
  );
}

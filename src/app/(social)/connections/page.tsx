import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConnectionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Mocked pending, accepted, and blocked connection states for demo UI.</p>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deadlineManagementItems } from "@/lib/mock/coordinator-institutional";

export default function CoordinatorDeadlineManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Deadline Management</h1>
        <p className="text-muted-foreground">Official and effective due-date control for coordinator-assigned obligations.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Deadline controls</CardTitle><CardDescription>Includes approved override basis when applicable.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {deadlineManagementItems.map((item) => (
            <div key={item.id} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{item.obligation} ({item.id})</p>
              <p className="text-muted-foreground">Destination: {item.destination}</p>
              <p className="text-muted-foreground">Official due: {item.officialDueDate} · Effective due: {item.effectiveDueDate}</p>
              <p className="text-muted-foreground">Override basis: {item.overrideBasis ?? "None"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { managedProcedureSets } from "@/lib/mock/coordinator-institutional";

export default function CoordinatorProcedureManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Procedure Management</h1>
        <p className="text-muted-foreground">Configured procedure definitions and applicability by assigned destination scope.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Assigned procedure sets</CardTitle><CardDescription>Mocked published sets available for coordinator governance.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {managedProcedureSets.map((set) => (
            <div key={set.id} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{set.name} ({set.id})</p>
              <p className="text-muted-foreground">State: {set.state}</p>
              <p className="text-muted-foreground">Destinations: {set.destinations.join(", ")}</p>
              <p className="text-muted-foreground">Procedures: {set.procedures.join(" · ")}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { studentMobilities } from "@/lib/mock/coordinator-institutional";

export default function CoordinatorStudentMobilitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Student Mobilities</h1>
        <p className="text-muted-foreground">Managed mobility records in your review scope (destination/procedure assignment).</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Assigned mobility records</CardTitle><CardDescription>Coordinator-scoped records only.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {studentMobilities.map((mobility) => (
            <div key={mobility.mobilityId} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{mobility.studentName} · {mobility.mobilityId}</p>
                <Badge>{mobility.state}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{mobility.hostInstitution} · {mobility.destination}</p>
              <p className="text-sm text-muted-foreground">Lifecycle stage: {mobility.lifecycleStage}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

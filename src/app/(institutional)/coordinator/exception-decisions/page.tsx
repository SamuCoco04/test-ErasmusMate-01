import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exceptionDecisions } from "@/lib/mock/coordinator-institutional";

export default function CoordinatorExceptionDecisionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Exception Decisions</h1>
        <p className="text-muted-foreground">Governed exception handling for deadline and document-obligation adjustments.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Active exception requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {exceptionDecisions.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{item.id} · {item.studentName}</p>
                <Badge>{item.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.scope} · Requested effect: {item.requestedEffect}</p>
              <p className="mt-1 text-sm">Rationale: {item.rationale}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { exceptions } from "@/lib/mock/student-institutional";

export default function StudentExceptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Exception Requests</h1>
        <p className="text-muted-foreground">Request and track deadline/document/procedure exceptions in official workflow.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My exception requests</CardTitle>
          <CardDescription>Each exception is constrained to explicitly covered obligations only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {exceptions.map((exception) => (
            <div key={exception.id} className="rounded-lg border bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{exception.id}</p>
                <Badge variant="outline">{exception.state}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Scope: {exception.scope}</p>
              <p className="text-sm">{exception.rationale}</p>
              <Link href={`/student/submissions/${exception.submissionId}`} className="mt-2 inline-block text-sm text-blue-700 underline underline-offset-2">
                Related submission {exception.submissionId}
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

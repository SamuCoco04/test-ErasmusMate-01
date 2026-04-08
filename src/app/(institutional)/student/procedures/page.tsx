import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { submissions } from "@/lib/mock/student-institutional";

export default function StudentProceduresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Official Procedures</h1>
        <p className="text-muted-foreground">Applicable institutional procedures and their current submission paths.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Procedure obligations</CardTitle>
          <CardDescription>Only published, applicable procedures are shown for this mobility context.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {submissions.map((submission) => (
            <div key={submission.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div>
                <p className="font-medium">{submission.procedure}</p>
                <p className="text-sm text-muted-foreground">{submission.stage}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{submission.state}</Badge>
                <Link href={`/student/submissions/${submission.id}`} className="text-sm text-blue-700 underline underline-offset-2">
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { reviewQueue } from "@/lib/mock/coordinator-institutional";

export default function CoordinatorReviewQueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Review Queue</h1>
        <p className="text-muted-foreground">Assigned submissions awaiting coordinator validation and institutional decision.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Assigned records</CardTitle>
          <CardDescription>Only submissions in coordinator scope are listed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviewQueue.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{item.studentName} · {item.procedure}</p>
                <Badge>{item.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.id} · {item.procedureSet} · {item.destination} · Due {item.dueDate}</p>
              <Link href={`/coordinator/review/${item.id}`} className="mt-2 inline-block text-sm text-blue-700 underline underline-offset-2">Open review detail</Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

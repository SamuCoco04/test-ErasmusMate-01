"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInstitutionalStore } from "@/lib/state/institutional-store";

export default function CoordinatorReviewQueuePage() {
  const queue = useInstitutionalStore((store) =>
    Object.values(store.submissions)
      .filter((item) => ["submitted", "in_review", "resubmitted"].includes(item.state))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Review Queue</h1>
        <p className="text-muted-foreground">Assigned submissions awaiting coordinator validation and institutional decision.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Assigned records</CardTitle>
          <CardDescription>Shared institutional state controls queue visibility and review lifecycle transitions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {queue.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{item.procedure}</p>
                <Badge>{item.state}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.id} · Stage {item.stage} · Due {item.dueDate}</p>
              <Link href={`/coordinator/review/${item.id}`} className="mt-2 inline-block text-sm text-blue-700 underline underline-offset-2">
                Open review detail
              </Link>
            </div>
          ))}
          {queue.length === 0 && <p className="text-sm text-muted-foreground">No submissions in submitted/in_review/resubmitted states.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCoordinatorQueueQuery, useExceptionsQuery } from "@/lib/query/institutional-hooks";

const priorityStyle: Record<string, string> = {
  submitted: "bg-sky-100 text-sky-800 border-sky-200",
  in_review: "bg-amber-100 text-amber-800 border-amber-200",
  resubmitted: "bg-violet-100 text-violet-800 border-violet-200",
};

export default function CoordinatorDashboardPage() {
  const { data: queue = [] } = useCoordinatorQueueQuery();
  const { data: exceptions = [] } = useExceptionsQuery();

  const pendingExceptions = exceptions.filter((item) => ["submitted", "in_review", "approved"].includes(item.state));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Coordinator Dashboard</h1>
        <p className="text-muted-foreground">Operational oversight powered by shared institutional workflow state.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>{queue.length}</CardTitle><CardDescription>Review queue</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{pendingExceptions.length}</CardTitle><CardDescription>Exception decisions</CardDescription></CardHeader></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Priority review queue</CardTitle>
          <CardDescription>Only transition-eligible records are shown.</CardDescription>
        </CardHeader>
        <div className="space-y-3 p-6 pt-0">
          {queue.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div>
                <p className="font-medium">{item.procedure}</p>
                <p className="text-sm text-muted-foreground">{item.id} · Due {item.dueDate} · {item.stage}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={priorityStyle[item.state] ?? ""}>{item.state}</Badge>
                <Link href={`/coordinator/review/${item.id}`} className="text-sm text-blue-700 underline underline-offset-2">Review</Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

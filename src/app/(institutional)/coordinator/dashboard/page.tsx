"use client";

import { useMemo } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInstitutionalStoreSnapshot } from "@/lib/state/institutional-store";

const priorityStyle: Record<string, string> = {
  submitted: "bg-sky-100 text-sky-800 border-sky-200",
  in_review: "bg-amber-100 text-amber-800 border-amber-200",
  resubmitted: "bg-violet-100 text-violet-800 border-violet-200",
};

export default function CoordinatorDashboardPage() {
  const snapshot = useInstitutionalStoreSnapshot();
  const submissions = useMemo(() => Object.values(snapshot.submissions), [snapshot.submissions]);
  const queue = useMemo(
    () => submissions.filter((item) => ["submitted", "in_review", "resubmitted"].includes(item.state)),
    [submissions],
  );
  const exceptions = snapshot.exceptions;
  const pendingExceptions = useMemo(
    () => exceptions.filter((item) => ["submitted", "in_review", "approved"].includes(item.state)),
    [exceptions],
  );
  const approvedCount = useMemo(() => submissions.filter((item) => item.state === "approved").length, [submissions]);
  const rejectedCount = useMemo(() => submissions.filter((item) => item.state === "rejected").length, [submissions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Coordinator Dashboard</h1>
        <p className="text-muted-foreground">Operational oversight powered by shared institutional workflow state.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>{queue.length}</CardTitle><CardDescription>Review queue</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{pendingExceptions.length}</CardTitle><CardDescription>Exception decisions</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{approvedCount}</CardTitle><CardDescription>Approved submissions</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{rejectedCount}</CardTitle><CardDescription>Rejected submissions</CardDescription></CardHeader></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Priority review queue</CardTitle>
          <CardDescription>Only transition-eligible records are shown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>
    </div>
  );
}

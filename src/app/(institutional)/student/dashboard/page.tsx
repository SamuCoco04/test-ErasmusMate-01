"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { myMobilityRecord } from "@/lib/mock/student-institutional";
import { useInstitutionalStore } from "@/lib/state/institutional-store";

const statusStyle: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  in_review: "bg-blue-100 text-blue-800 border-blue-200",
  draft: "bg-slate-100 text-slate-700 border-slate-300",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
  reopened: "bg-amber-100 text-amber-800 border-amber-200",
  resubmitted: "bg-blue-100 text-blue-800 border-blue-200",
  archived: "bg-zinc-100 text-zinc-700 border-zinc-300",
  overridden: "bg-amber-100 text-amber-800 border-amber-200",
  overdue: "bg-rose-100 text-rose-800 border-rose-200",
  upcoming: "bg-sky-100 text-sky-800 border-sky-200",
};

export default function StudentDashboardPage() {
  const submissions = useInstitutionalStore((store) =>
    Object.values(store.submissions).filter((submission) => submission.stage !== "Coordinator review"),
  );
  const deadlines = useInstitutionalStore((store) => store.deadlines);

  const actionItems = submissions.filter((submission) => ["draft", "submitted", "in_review", "rejected", "reopened"].includes(submission.state));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Welcome back, {myMobilityRecord.studentName}</h1>
        <p className="text-muted-foreground">Official institutional overview of your Erasmus mobility record and obligations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {myMobilityRecord.period}
            <Badge className={statusStyle[myMobilityRecord.state]}>{myMobilityRecord.state}</Badge>
          </CardTitle>
          <CardDescription>
            {myMobilityRecord.hostInstitution} · {myMobilityRecord.destination}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/student/my-mobility" className="text-sm text-blue-700 underline underline-offset-2">
            View mobility lifecycle
          </Link>
          <Link href="/student/deadlines" className="text-sm text-blue-700 underline underline-offset-2">
            Open deadlines
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action required</CardTitle>
          <CardDescription>Open institutional submissions that still require action.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {actionItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div>
                <p className="font-medium">{item.procedure}</p>
                <p className="text-sm text-muted-foreground">
                  {item.id} · Due {item.dueDate}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusStyle[item.state]}>{item.state}</Badge>
                <Link href={`/student/submissions/${item.id}`} className="text-sm text-blue-700 underline underline-offset-2">
                  Open
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deadline watch</CardTitle>
          <CardDescription>Effective dates account for approved overrides.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {deadlines.map((deadline) => (
            <div key={deadline.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div>
                <p className="font-medium">{deadline.obligation}</p>
                <p className="text-sm text-muted-foreground">Effective due date: {deadline.effectiveDueDate}</p>
              </div>
              <Badge className={statusStyle[deadline.state]}>{deadline.state}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

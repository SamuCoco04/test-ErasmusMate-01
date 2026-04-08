import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { coordinatorScope, exceptionDecisions, reviewQueue, signatureRequests, studentMobilities } from "@/lib/mock/coordinator-institutional";

const priorityStyle = {
  urgent: "bg-rose-100 text-rose-800 border-rose-200",
  high: "bg-amber-100 text-amber-800 border-amber-200",
  standard: "bg-slate-100 text-slate-700 border-slate-300",
};

export default function CoordinatorDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Coordinator Dashboard</h1>
        <p className="text-muted-foreground">Operational oversight for assigned institutional submissions, signatures, exceptions, and mobility records.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coordinator scope</CardTitle>
          <CardDescription>{coordinatorScope.coordinatorName} · Institutionally assigned context only.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <p>Destinations: {coordinatorScope.assignedDestinations.join(", ")}</p>
          <p>Procedure sets: {coordinatorScope.assignedProcedureSets.join(", ")}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>{reviewQueue.length}</CardTitle><CardDescription>Review queue</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{signatureRequests.length}</CardTitle><CardDescription>Signature requests</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{exceptionDecisions.length}</CardTitle><CardDescription>Exception decisions</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{studentMobilities.length}</CardTitle><CardDescription>Student mobilities</CardDescription></CardHeader></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Priority review queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviewQueue.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div>
                <p className="font-medium">{item.studentName} · {item.procedure}</p>
                <p className="text-sm text-muted-foreground">{item.id} · Due {item.dueDate} · {item.destination}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={priorityStyle[item.priority]}>{item.priority}</Badge>
                <Link href={`/coordinator/review/${item.id}`} className="text-sm text-blue-700 underline underline-offset-2">Review</Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

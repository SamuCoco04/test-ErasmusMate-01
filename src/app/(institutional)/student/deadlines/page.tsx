"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInstitutionalStore } from "@/lib/state/institutional-store";

export default function StudentDeadlinesPage() {
  const deadlines = useInstitutionalStore((store) => store.deadlines);
  const exceptions = useInstitutionalStore((store) => store.exceptions);

  const hasApprovedDeadlineException = (deadlineId: string, submissionId?: string) =>
    exceptions.some(
      (exception) =>
        exception.scope === "deadline" &&
        ["approved", "applied"].includes(exception.state) &&
        (exception.coveredTargetId === deadlineId || (!exception.coveredTargetId && submissionId && exception.submissionId === submissionId)),
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Deadline Governance</h1>
        <p className="text-muted-foreground">Upcoming, overdue, and override-adjusted institutional deadlines.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Official deadlines</CardTitle>
          <CardDescription>Effective due dates reflect approved extension or exception overrides.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {deadlines.map((deadline) => {
            const isOverriddenByException = hasApprovedDeadlineException(deadline.id, deadline.submissionId);
            const effectiveState = isOverriddenByException ? "overridden" : deadline.state;

            return (
              <div key={deadline.id} className="rounded-lg border bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium">{deadline.obligation}</p>
                  <Badge
                    className={
                      effectiveState === "upcoming"
                        ? "bg-sky-100 text-sky-800 border-sky-200"
                        : effectiveState === "overridden"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-rose-100 text-rose-800 border-rose-200"
                    }
                  >
                    {effectiveState}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Official due: {deadline.officialDueDate}</p>
                <p className="text-sm text-muted-foreground">Effective due: {deadline.effectiveDueDate}</p>
                {deadline.overrideBasis && <p className="mt-1 text-sm">Override basis: {deadline.overrideBasis}</p>}
                {isOverriddenByException && <p className="mt-1 text-xs text-amber-700">Approved exception supersedes overdue status for covered scope.</p>}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

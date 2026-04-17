"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useExceptionDecisionMutation, useExceptionsQuery } from "@/lib/query/institutional-hooks";

const COORDINATOR_ID = "coord-anna-jensen";

export default function CoordinatorExceptionDecisionsPage() {
  const { data: exceptions = [] } = useExceptionsQuery();
  const activeExceptions = exceptions.filter((item) => ["submitted", "in_review", "approved", "applied"].includes(item.state));
  const mutation = useExceptionDecisionMutation();
  const [decisionRationales, setDecisionRationales] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Exception Decisions</h1>
        <p className="text-muted-foreground">Governed exception handling for deadline and document-obligation adjustments.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Active exception requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {activeExceptions.map((item) => {
            const rationale = decisionRationales[item.id] ?? "";
            const canDecide = rationale.trim().length >= 10;

            return (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.id} · Submission {item.submissionId}</p>
                  <Badge>{item.state}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.scope} · Requested effect: {item.requestedEffect}</p>
                <p className="mt-1 text-sm">Rationale: {item.rationale}</p>

                <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
                  <Input placeholder="Decision rationale (required)" value={rationale} onChange={(event) => setDecisionRationales((prev) => ({ ...prev, [item.id]: event.target.value }))} />
                  <Button type="button" variant="outline" disabled={item.state !== "submitted" || mutation.isPending} onClick={() => mutation.mutate({ exceptionId: item.id, rationale, coordinatorId: COORDINATOR_ID, decision: "start" })}>Start review</Button>
                  <Button type="button" disabled={!canDecide || (item.state !== "submitted" && item.state !== "in_review") || mutation.isPending} onClick={() => mutation.mutate({ exceptionId: item.id, rationale, coordinatorId: COORDINATOR_ID, decision: "approve" })}>Approve</Button>
                  <Button type="button" variant="outline" disabled={!canDecide || (item.state !== "submitted" && item.state !== "in_review") || mutation.isPending} onClick={() => mutation.mutate({ exceptionId: item.id, rationale, coordinatorId: COORDINATOR_ID, decision: "reject" })}>Reject</Button>
                </div>

                <div className="mt-2 flex gap-2">
                  <Button type="button" variant="outline" disabled={item.state !== "approved" || mutation.isPending} onClick={() => mutation.mutate({ exceptionId: item.id, rationale, coordinatorId: COORDINATOR_ID, decision: "apply" })}>Apply approved exception</Button>
                  <Button type="button" variant="outline" disabled={item.state !== "applied" || mutation.isPending} onClick={() => mutation.mutate({ exceptionId: item.id, rationale, coordinatorId: COORDINATOR_ID, decision: "close" })}>Close applied exception</Button>
                  {rationale.trim().length > 0 && rationale.trim().length < 10 && <p className="text-xs text-rose-700">Minimum rationale length is 10 characters.</p>}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

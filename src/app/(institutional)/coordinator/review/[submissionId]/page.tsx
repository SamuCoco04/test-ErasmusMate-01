"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { institutionalService } from "@/lib/services/institutional-service";
import { useReviewDecisionMutation } from "@/lib/query/institutional-hooks";
import { useInstitutionalStore } from "@/lib/state/institutional-store";

const decisionStyle = {
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
  reopened: "bg-amber-100 text-amber-800 border-amber-200",
};

const COORDINATOR_ID = "coord-anna-jensen";

type Decision = "approved" | "rejected" | "reopened";

export default function CoordinatorReviewDetailPage() {
  const params = useParams<{ submissionId: string }>();
  const submission = useInstitutionalStore((store) => store.submissions[params.submissionId]);
  const docs = useInstitutionalStore((store) => store.requiredDocsBySubmissionId[params.submissionId] ?? []);
  const auditEvents = useInstitutionalStore((store) => store.auditLog.filter((entry) => entry.submissionId === params.submissionId));

  const [rationale, setRationale] = useState("");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const mutation = useReviewDecisionMutation(params.submissionId);

  const rationaleValid = rationale.trim().length >= 12;
  const disabledDecision = useMemo(() => !rationaleValid || mutation.isPending || submission?.state !== "in_review", [rationaleValid, mutation.isPending, submission?.state]);

  if (!submission) {
    return <div className="rounded-lg border bg-white p-4">Submission not found in coordinator scope.</div>;
  }

  const applyDecision = async (nextDecision: Decision) => {
    if (!rationaleValid || mutation.isPending) return;

    const response = await mutation
      .mutateAsync({ decision: nextDecision, rationale: rationale.trim(), coordinatorId: COORDINATOR_ID })
      .catch((error: Error) => {
        setBanner({ type: "error", message: error.message });
        return null;
      });

    if (response) {
      setDecision(nextDecision);
      setBanner({ type: response.outcome === "success" ? "success" : "error", message: response.details });
      setRationale("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Review Submission</h1>
        <p className="text-muted-foreground">{submission.procedure} · {submission.id}</p>
      </div>

      {banner && (
        <div className={`rounded-md border p-3 text-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {banner.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submission state</CardTitle>
          <CardDescription>Valid lifecycle: draft → submitted → in_review → rejected/reopened/resubmitted/approved.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Current state: <span className="font-medium">{submission.state}</span></p>
          <p>Due date: {submission.dueDate}</p>
          <p>Submitted snapshots: {submission.submittedVersions.length}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={submission.state !== "submitted"}
              onClick={() => {
                const result = institutionalService.startReview(submission.id, COORDINATOR_ID);
                setBanner({ type: result.outcome === "success" ? "success" : "error", message: result.details });
              }}
            >
              Start review
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Validation checklist</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {docs.map((doc) => (
            <div key={doc.id} className="rounded-md border p-2">
              {doc.title} · {doc.required ? "required" : "optional"} · {doc.status}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review decision</CardTitle>
          <CardDescription>Reject and reopen require rationale and are blocked outside in_review state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block text-sm font-medium" htmlFor="rationale">Decision rationale</label>
          <textarea
            id="rationale"
            className="min-h-24 w-full rounded-md border bg-white p-2 text-sm"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Document institutional reasoning for student-visible decision."
          />
          {!rationaleValid && <p className="text-sm text-rose-700">Provide at least 12 characters of rationale.</p>}

          <div className="flex flex-wrap gap-2">
            <Button disabled={disabledDecision} onClick={() => applyDecision("approved")}>{mutation.isPending ? "Processing..." : "Approve"}</Button>
            <Button variant="outline" disabled={disabledDecision} onClick={() => applyDecision("rejected")}>Reject</Button>
            <Button variant="outline" disabled={disabledDecision} onClick={() => applyDecision("reopened")}>Reopen</Button>
          </div>

          {decision && <Badge className={decisionStyle[decision]}>Latest action: {decision}</Badge>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Audit event log</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {auditEvents.length === 0 && <p className="text-muted-foreground">No audit events yet for this submission.</p>}
          {auditEvents.map((event) => (
            <div key={event.id} className="rounded-md border bg-white p-2">
              <p className="font-medium">{event.id} · {event.timestamp}</p>
              <p className="text-muted-foreground">{event.actorId}</p>
              <p>{event.action} ({event.outcome})</p>
              <p className="text-muted-foreground">{event.previousState ?? "-"} → {event.nextState ?? "-"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

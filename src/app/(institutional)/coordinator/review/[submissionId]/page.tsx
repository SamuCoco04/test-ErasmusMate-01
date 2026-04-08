"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { reviewDetailBySubmissionId } from "@/lib/mock/coordinator-institutional";
import { useReviewDecisionMutation } from "@/lib/query/institutional-hooks";
import { useInstitutionalStore } from "@/lib/state/institutional-store";

const decisionStyle = {
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
  reopened: "bg-amber-100 text-amber-800 border-amber-200",
  delegated: "bg-blue-100 text-blue-800 border-blue-200",
};

type Decision = "approved" | "rejected" | "reopened";

export default function CoordinatorReviewDetailPage() {
  const params = useParams<{ submissionId: string }>();
  const detail = reviewDetailBySubmissionId[params.submissionId as keyof typeof reviewDetailBySubmissionId];

  const [rationale, setRationale] = useState("");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const mutation = useReviewDecisionMutation(params.submissionId);

  const auditEvents = useInstitutionalStore((store) =>
    store.auditLog
      .filter((entry) => entry.submissionId === params.submissionId)
      .map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        actor: entry.actorId,
        action: `${entry.action.replaceAll("_", " ")} (${entry.outcome})${entry.rationale ? `: ${entry.rationale}` : ""}`,
      })),
  );

  const sharedSubmissionState = useInstitutionalStore((store) => store.submissions[params.submissionId]?.state);

  useEffect(() => {
    setRationale("");
    setDecision(null);
    setBanner(null);
  }, [params.submissionId, detail]);

  const rationaleValid = rationale.trim().length >= 12;

  const disabledDecision = useMemo(() => !rationaleValid || mutation.isPending, [rationaleValid, mutation.isPending]);

  if (!detail) {
    return <div className="rounded-lg border bg-white p-4">Submission not found in coordinator scope.</div>;
  }

  const applyDecision = async (nextDecision: Decision) => {
    if (!rationaleValid || mutation.isPending) return;

    const response = await mutation
      .mutateAsync({ decision: nextDecision, rationale: rationale.trim(), coordinatorId: "coordinator:anna-jensen" })
      .catch((error: Error) => {
        setBanner({ type: "error", message: error.message });
        return null;
      });

    if (response) {
      setDecision(nextDecision);
      setBanner({ type: "success", message: response.details });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Review Submission</h1>
        <p className="text-muted-foreground">{detail.procedure} · {detail.id}</p>
      </div>

      {banner && (
        <div className={`rounded-md border p-3 text-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {banner.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{detail.studentName}</CardTitle>
          <CardDescription>{detail.hostInstitution} · {detail.destination}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <p>Submitted: {detail.submittedAt}</p>
          <p>Review deadline: {detail.reviewDeadline}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Validation checklist</CardTitle>
            <CardDescription>Institutional checks before decision.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {detail.validationChecklist.map((item) => (
              <div key={item} className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm">✓ {item}</div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Reviewer comments</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {detail.reviewerComments.map((comment) => <p key={comment} className="rounded-md border bg-slate-50 p-2">{comment}</p>)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Deficiency notes</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {detail.deficiencyNotes.map((note) => <p key={note} className="rounded-md border border-amber-200 bg-amber-50 p-2">{note}</p>)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review decision</CardTitle>
          <CardDescription>Approve or reject requires rationale. Reopen creates auditable entries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block text-sm font-medium" htmlFor="rationale">Decision rationale (required)</label>
          <textarea
            id="rationale"
            className="min-h-24 w-full rounded-md border bg-white p-2 text-sm"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Document institutional reasoning for student-visible decision."
          />
          {!rationaleValid && <p className="text-sm text-rose-700">Provide at least 12 characters of rationale before approve/reject.</p>}

          <div className="flex flex-wrap gap-2">
            <Button disabled={disabledDecision} onClick={() => applyDecision("approved")}>{mutation.isPending ? "Processing..." : "Approve"}</Button>
            <Button variant="outline" disabled={disabledDecision} onClick={() => applyDecision("rejected")}>Reject</Button>
            <Button variant="outline" disabled={disabledDecision} onClick={() => applyDecision("reopened")}>Reopen</Button>
            <Button variant="outline" disabled title="Delegation is unavailable here until it is connected to the shared audit log.">Delegate (unavailable)</Button>
          </div>

          {decision && <Badge className={decisionStyle[decision]}>Latest action: {decision}</Badge>}
          {sharedSubmissionState && <p className="text-sm text-muted-foreground">Shared state: {sharedSubmissionState}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Audit event log</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {auditEvents.length === 0 && <p className="text-muted-foreground">No shared audit events yet for this submission.</p>}
          {auditEvents.map((event) => (
            <div key={event.id} className="rounded-md border bg-white p-2">
              <p className="font-medium">{event.id} · {event.timestamp}</p>
              <p className="text-muted-foreground">{event.actor}</p>
              <p>{event.action}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

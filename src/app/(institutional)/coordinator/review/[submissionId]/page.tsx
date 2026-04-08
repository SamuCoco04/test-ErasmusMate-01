"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { reviewDetailBySubmissionId } from "@/lib/mock/coordinator-institutional";

const decisionStyle = {
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
  reopened: "bg-amber-100 text-amber-800 border-amber-200",
  delegated: "bg-blue-100 text-blue-800 border-blue-200",
};

type Decision = keyof typeof decisionStyle;

export default function CoordinatorReviewDetailPage() {
  const params = useParams<{ submissionId: string }>();
  const detail = reviewDetailBySubmissionId[params.submissionId as keyof typeof reviewDetailBySubmissionId];

  const [rationale, setRationale] = useState("");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [auditEvents, setAuditEvents] = useState(detail?.auditEvents ?? []);

  const rationaleValid = rationale.trim().length >= 12;

  const disabledDecision = useMemo(() => !rationaleValid, [rationaleValid]);

  if (!detail) {
    return <div className="rounded-lg border bg-white p-4">Submission not found in coordinator scope.</div>;
  }

  const addAuditEvent = (action: string) => {
    setAuditEvents((prev) => [
      {
        id: `AUD-${7700 + prev.length + 1}`,
        timestamp: "2026-03-10 09:45",
        actor: "Dr. Anna Jensen",
        action,
      },
      ...prev,
    ]);
  };

  const applyDecision = (nextDecision: Decision) => {
    if (!rationaleValid) {
      return;
    }
    setDecision(nextDecision);
    addAuditEvent(`Decision ${nextDecision} recorded with rationale: ${rationale.trim()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Review Submission</h1>
        <p className="text-muted-foreground">{detail.procedure} · {detail.id}</p>
      </div>

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
          <CardDescription>Approve or reject requires rationale. Reopen and delegate actions create auditable entries.</CardDescription>
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
            <Button disabled={disabledDecision} onClick={() => applyDecision("approved")}>Approve</Button>
            <Button variant="destructive" disabled={disabledDecision} onClick={() => applyDecision("rejected")}>Reject</Button>
            <Button variant="outline" onClick={() => { setDecision("reopened"); addAuditEvent("Submission reopened for student resubmission"); }}>Reopen</Button>
            <Button variant="outline" onClick={() => { setDecision("delegated"); addAuditEvent("Review delegated to Prof. Miguel Torres (backup coordinator)"); }}>Delegate</Button>
          </div>

          {decision && <Badge className={decisionStyle[decision]}>Latest action: {decision}</Badge>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Audit event log (mock)</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
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

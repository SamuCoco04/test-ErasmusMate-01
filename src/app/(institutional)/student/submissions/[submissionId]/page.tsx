"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  useExceptionsQuery,
  useFinalSubmitMutation,
  useResubmitAfterRejectionMutation,
  useSaveSubmissionDraftMutation,
  useSubmissionQuery,
} from "@/lib/query/institutional-hooks";

const schema = z.object({
  submissionMetadata: z.string().min(10, "Required metadata must include at least 10 characters."),
  studyCycle: z.string().min(1, "Study cycle is mandatory."),
});

type FormValues = z.infer<typeof schema>;

export default function StudentSubmissionDetailPage() {
  const params = useParams<{ submissionId: string }>();

  const { data: submission } = useSubmissionQuery(params.submissionId);
  const { data: linkedExceptions = [] } = useExceptionsQuery(params.submissionId);

  const saveDraftMutation = useSaveSubmissionDraftMutation(params.submissionId);
  const finalSubmitMutation = useFinalSubmitMutation(params.submissionId);
  const resubmitMutation = useResubmitAfterRejectionMutation(params.submissionId);

  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      submissionMetadata: "",
      studyCycle: "Bachelor",
    },
    mode: "onChange",
  });

  const { reset } = form;

  useEffect(() => {
    if (!submission) return;
    reset({
      submissionMetadata: submission?.draftPayload?.submissionMetadata ? String(submission.draftPayload.submissionMetadata) : "",
      studyCycle: submission?.draftPayload?.studyCycle ? String(submission.draftPayload.studyCycle) : "Bachelor",
    });
  }, [submission, reset]);

  const mockedValidationMessages = useMemo(
    () => [
      { type: "format", passed: true, message: "Accepted formats: PDF required for official records." },
      { type: "size", passed: true, message: "No blocking size violations detected." },
      { type: "quality", passed: true, message: "Quality checks passed for current draft payload." },
    ],
    [],
  );

  const blockedFinalSubmit = !form.formState.isValid;

  if (!submission) {
    return <div className="rounded-lg border bg-white p-4">Loading submission...</div>;
  }

  const auditEvents = submission.auditEvents ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Submission {submission.id}</h1>
        <p className="text-muted-foreground">
          {submission.procedure} · Current state: <span className="font-medium">{submission.state}</span>
        </p>
      </div>

      {linkedExceptions.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle>Linked exception effects</CardTitle>
            <CardDescription>Only approved/applied exceptions modify effective submission governance state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {linkedExceptions.map((exception) => (
              <div key={exception.id} className="rounded-md border border-amber-200 bg-white p-3">
                <p className="font-medium">{exception.id} · {exception.scope} · {exception.state}</p>
                <p>Requested: {exception.requestedEffect}</p>
                {exception.appliedEffectSummary && <p className="text-emerald-700">Applied: {exception.appliedEffectSummary}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {banner && (
        <div className={`rounded-md border p-3 text-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {banner.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>File validation messages</CardTitle>
          <CardDescription>Institutional checks for format, size, and technical quality criteria.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockedValidationMessages.map((msg) => (
            <div key={msg.type} className={`rounded-md border p-3 text-sm ${msg.passed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
              <span className="font-medium uppercase">{msg.type}</span>: {msg.message}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submission metadata</CardTitle>
          <CardDescription>Mandatory structured fields required before final submit.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(() => undefined)}>
              <FormField control={form.control} name="studyCycle" render={({ field }) => (
                <FormItem>
                  <FormLabel>Study cycle</FormLabel>
                  <FormControl><Input {...field} placeholder="Bachelor / Master" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="submissionMetadata" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Submission metadata</FormLabel>
                  <FormControl><Input {...field} placeholder="Include mandatory host program metadata" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {blockedFinalSubmit && <div className="md:col-span-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">Final submission blocked: complete required metadata first.</div>}

              <div className="md:col-span-2 flex gap-3">
                <Button type="button" variant="outline" disabled={saveDraftMutation.isPending} onClick={async () => {
                  const result = await saveDraftMutation.mutateAsync(form.getValues()).catch((error: Error) => ({ outcome: "blocked", details: error.message }));
                  setBanner({ type: result.outcome === "success" ? "success" : "error", message: result.details });
                }}>Save draft</Button>
                <Button type="button" disabled={blockedFinalSubmit || finalSubmitMutation.isPending || resubmitMutation.isPending} onClick={async () => {
                  const valid = await form.trigger();
                  if (!valid) return;

                  if (submission.state === "rejected" || submission.state === "reopened") {
                    const result = await resubmitMutation.mutateAsync(form.getValues()).catch((error: Error) => ({ outcome: "blocked", details: error.message }));
                    setBanner({ type: result.outcome === "success" ? "success" : "error", message: result.details });
                    return;
                  }

                  await saveDraftMutation.mutateAsync(form.getValues()).catch(() => undefined);
                  const result = await finalSubmitMutation.mutateAsync().catch((error: Error) => ({ outcome: "blocked", details: error.message }));
                  setBanner({ type: result.outcome === "success" ? "success" : "error", message: result.details });
                }}>{submission.state === "rejected" || submission.state === "reopened" ? "Resubmit after correction" : "Final submit"}</Button>
              </div>
            </form>
          </Form>

          {auditEvents.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Latest audit events</p>
              {auditEvents.slice(0, 5).map((event) => (
                <p key={event.id} className="text-xs text-muted-foreground">
                  {new Date(event.createdAt).toLocaleString()} · {event.eventType} · {event.priorState ?? "-"} → {event.newState ?? "-"}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

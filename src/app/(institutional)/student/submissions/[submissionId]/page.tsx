"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { requiredDocumentsForSubmission, submissions } from "@/lib/mock/student-institutional";

const schema = z.object({
  submissionMetadata: z.string().min(10, "Required metadata must include at least 10 characters."),
  studyCycle: z.string().min(1, "Study cycle is mandatory."),
});

type FormValues = z.infer<typeof schema>;

export default function StudentSubmissionDetailPage() {
  const [lastAction, setLastAction] = useState<"draft" | "submit" | null>(null);
  const params = useParams<{ submissionId: string }>();

  const submission = submissions.find((item) => item.id === params.submissionId) ?? null;

  const requiredDocs = requiredDocumentsForSubmission.filter((doc) => doc.required);
  const missingRequiredDocs = requiredDocs.filter((doc) => doc.status === "missing");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      submissionMetadata: submission?.mandatoryMetadataComplete ? "Host contact validated with current semester program." : "",
      studyCycle: "Bachelor",
    },
    mode: "onChange",
  });

  const mockedValidationMessages = useMemo(
    () => [
      {
        type: "format",
        passed: true,
        message: "Accepted formats: PDF required for official records.",
      },
      {
        type: "size",
        passed: false,
        message: "Language_Certificate.jpg exceeds the configured maximum size (12.6 MB > 5 MB).",
      },
      {
        type: "quality",
        passed: false,
        message: "Course catalog scan quality check failed: highlighted courses not clearly visible.",
      },
    ],
    [],
  );

  const blockedFinalSubmit = missingRequiredDocs.length > 0 || !form.formState.isValid;

  if (!submission) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Submission not found</CardTitle>
            <CardDescription>
              The requested submission does not exist or is no longer available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/student/procedures">Back to procedures</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Submission {submission.id}</h1>
        <p className="text-muted-foreground">
          {submission.procedure} · Current state: <span className="font-medium">{submission.state}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Required document checklist</CardTitle>
          <CardDescription>Final submission is blocked until all mandatory files and metadata are complete.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {requiredDocumentsForSubmission.map((doc) => (
            <div key={doc.id} className="rounded-lg border bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{doc.title}</p>
                <Badge
                  className={
                    doc.status === "attached"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : doc.status === "missing"
                        ? "bg-rose-100 text-rose-800 border-rose-200"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                  }
                >
                  {doc.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Required format: {doc.format.toUpperCase()} · Max size {doc.maxSizeMb} MB
              </p>
              {doc.fileName && (
                <p className="text-xs text-muted-foreground">
                  Uploaded: {doc.fileName} ({doc.fileSizeMb} MB)
                </p>
              )}
              {doc.qualityRule && <p className="mt-1 text-xs text-muted-foreground">Quality rule: {doc.qualityRule}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File validation messages</CardTitle>
          <CardDescription>Mocked blocking checks for format, size, and technical quality criteria.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockedValidationMessages.map((msg) => (
            <div
              key={msg.type}
              className={`rounded-md border p-3 text-sm ${msg.passed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}
            >
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
              <FormField
                control={form.control}
                name="studyCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study cycle</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Bachelor / Master" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="submissionMetadata"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Submission metadata</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Include mandatory host program metadata" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {blockedFinalSubmit && (
                <div className="md:col-span-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  Final submission blocked: complete all mandatory documents and required metadata first.
                </div>
              )}

              <div className="md:col-span-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setLastAction("draft");
                  }}
                >
                  Save draft
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    const valid = await form.trigger();
                    if (valid && !blockedFinalSubmit) {
                      setLastAction("submit");
                    }
                  }}
                >
                  Final submit
                </Button>
              </div>
            </form>
          </Form>

          {lastAction === "draft" && (
            <p className="mt-3 text-sm text-blue-700">Draft saved. Draft state does not fulfill the official obligation until final submit.</p>
          )}
          {lastAction === "submit" && (
            <p className="mt-3 text-sm text-emerald-700">Submission sent to coordinator review (mock transition to submitted/in_review).</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

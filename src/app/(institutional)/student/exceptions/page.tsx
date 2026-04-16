"use client";

import { useMemo } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { institutionalService } from "@/lib/services/institutional-service";
import { useInstitutionalStoreSnapshot } from "@/lib/state/institutional-store";

const exceptionSchema = z.object({
  submissionId: z.string().min(1, "Submission is required."),
  scope: z.enum(["deadline", "document_obligation", "procedure_condition"]),
  coveredTargetId: z.string().optional(),
  rationale: z.string().min(12, "Provide a rationale with at least 12 characters."),
  requestedEffect: z.string().min(8, "Requested effect is required."),
});

type ExceptionFormValues = z.infer<typeof exceptionSchema>;

export default function StudentExceptionsPage() {
  const snapshot = useInstitutionalStoreSnapshot();
  const exceptions = snapshot.exceptions;
  const submissions = useMemo(() => Object.values(snapshot.submissions), [snapshot.submissions]);

  const form = useForm<ExceptionFormValues>({
    resolver: zodResolver(exceptionSchema),
    defaultValues: {
      submissionId: submissions[0]?.id ?? "",
      scope: "deadline",
      coveredTargetId: "",
      rationale: "",
      requestedEffect: "",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Exception Requests</h1>
        <p className="text-muted-foreground">Request and track deadline/document/procedure exceptions in official workflow.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create official exception request</CardTitle>
          <CardDescription>Scope-limited requests only. Effects are applied only to the covered deadline/obligation/condition.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={form.handleSubmit((values) => {
                const sanitizedValues = {
                  ...values,
                  coveredTargetId: values.coveredTargetId?.trim() ? values.coveredTargetId.trim() : undefined,
                };

                institutionalService.createExceptionRequest(sanitizedValues);
                form.reset({ ...sanitizedValues, rationale: "", requestedEffect: "", coveredTargetId: undefined });
              })}
            >
              <FormField
                control={form.control}
                name="submissionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...field}
                      >
                        {submissions.map((submission) => (
                          <option key={submission.id} value={submission.id}>
                            {submission.id} · {submission.procedure}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...field}
                      >
                        <option value="deadline">deadline</option>
                        <option value="document_obligation">document_obligation</option>
                        <option value="procedure_condition">procedure_condition</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coveredTargetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Covered target ID (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Example: DL-301 or course-catalog" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requestedEffect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requested effect</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Example: extend due date to 2026-03-14" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rationale"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Rationale</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Provide institutional rationale for request review."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <Button type="submit">Submit exception request</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My exception requests</CardTitle>
          <CardDescription>Each exception is constrained to explicitly covered obligations only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {exceptions.map((exception) => (
            <div key={exception.id} className="rounded-lg border bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{exception.id}</p>
                <Badge variant="outline">{exception.state}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Scope: {exception.scope}</p>
              <p className="text-sm text-muted-foreground">Requested effect: {exception.requestedEffect}</p>
              <p className="text-sm">{exception.rationale}</p>
              {exception.appliedEffectSummary && <p className="mt-1 text-sm text-emerald-700">Applied effect: {exception.appliedEffectSummary}</p>}
              <ul className="mt-2 space-y-1 rounded-md bg-slate-50 p-2 text-xs text-slate-700">
                {(exception.timeline ?? []).map((event) => (
                  <li key={event.id}>
                    {new Date(event.at).toLocaleString()} · {event.actorId} · {event.note}
                  </li>
                ))}
              </ul>
              <Link href={`/student/submissions/${exception.submissionId}`} className="mt-2 inline-block text-sm text-blue-700 underline underline-offset-2">
                Related submission {exception.submissionId}
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

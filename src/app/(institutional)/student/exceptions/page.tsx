"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSubmitExceptionRequestMutation } from "@/lib/query/institutional-hooks";
import { useInstitutionalStore } from "@/lib/state/institutional-store";

export default function StudentExceptionsPage() {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState("SUB-2026-0402");
  const [rationale, setRationale] = useState("");
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const exceptions = useInstitutionalStore((store) => store.exceptions);
  const submissions = useInstitutionalStore((store) => Object.values(store.submissions));
  const mutation = useSubmitExceptionRequestMutation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Exception Requests</h1>
        <p className="text-muted-foreground">Request and track deadline/document/procedure exceptions in official workflow.</p>
      </div>

      {banner && (
        <div className={`rounded-md border p-3 text-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {banner.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submit exception request</CardTitle>
          <CardDescription>Exception requests must include rationale and are reviewed by coordinator decision flow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <select className="flex h-10 w-full rounded-md border px-3 text-sm" value={selectedSubmissionId} onChange={(e) => setSelectedSubmissionId(e.target.value)}>
            {submissions.map((item) => (
              <option key={item.id} value={item.id}>{item.id} · {item.procedure}</option>
            ))}
          </select>
          <Input value={rationale} onChange={(event) => setRationale(event.target.value)} placeholder="Describe why you need this exception request." />
          <Button
            disabled={mutation.isPending}
            onClick={async () => {
              const response = await mutation.mutateAsync({ submissionId: selectedSubmissionId, rationale }).catch((error: Error) => {
                setBanner({ type: "error", message: error.message });
                return null;
              });
              if (response) {
                setBanner({ type: "success", message: response.details });
                setRationale("");
              }
            }}
          >
            {mutation.isPending ? "Submitting exception..." : "Submit exception request"}
          </Button>
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
              <p className="text-sm">{exception.rationale}</p>
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

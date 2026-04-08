"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDecideExceptionMutation } from "@/lib/query/institutional-hooks";
import { useInstitutionalStore } from "@/lib/state/institutional-store";

export default function CoordinatorExceptionDecisionsPage() {
  const [rationaleByException, setRationaleByException] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const exceptions = useInstitutionalStore((store) => store.exceptions);

  const mutation = useDecideExceptionMutation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Exception Decisions</h1>
        <p className="text-muted-foreground">Governed exception handling for deadline and document-obligation adjustments.</p>
      </div>

      {banner && (
        <div className={`rounded-md border p-3 text-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {banner.message}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Active exception requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {exceptions.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{item.id} · Submission {item.submissionId}</p>
                <Badge>{item.state}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.scope}</p>
              <p className="mt-1 text-sm">Rationale: {item.rationale}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Input
                  value={rationaleByException[item.id] ?? ""}
                  onChange={(event) => setRationaleByException((prev) => ({ ...prev, [item.id]: event.target.value }))}
                  placeholder="Coordinator decision rationale (12+ chars)"
                  className="max-w-md"
                />
                <Button
                  disabled={mutation.isPending}
                  onClick={async () => {
                    const response = await mutation
                      .mutateAsync({
                        exceptionId: item.id,
                        decision: "approved",
                        rationale: rationaleByException[item.id] ?? "",
                        coordinatorId: "coordinator:anna-jensen",
                      })
                      .catch((error: Error) => {
                        setBanner({ type: "error", message: error.message });
                        return null;
                      });
                    if (response) setBanner({ type: "success", message: response.details });
                  }}
                >
                  {mutation.isPending ? "Saving decision..." : "Approve"}
                </Button>
                <Button
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={async () => {
                    const response = await mutation
                      .mutateAsync({
                        exceptionId: item.id,
                        decision: "rejected",
                        rationale: rationaleByException[item.id] ?? "",
                        coordinatorId: "coordinator:anna-jensen",
                      })
                      .catch((error: Error) => {
                        setBanner({ type: "error", message: error.message });
                        return null;
                      });
                    if (response) setBanner({ type: "success", message: response.details });
                  }}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

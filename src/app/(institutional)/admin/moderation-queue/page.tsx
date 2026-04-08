"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { moderationCases } from "@/lib/mock/admin-governance";

const moderationDecisionSchema = z.object({
  caseId: z.string().min(3, "Case ID is required."),
  decision: z.enum(["hide", "remove", "restrict", "clear"]),
  rationale: z.string().min(10, "Decision rationale is required."),
});

type ModerationDecisionValues = z.infer<typeof moderationDecisionSchema>;

export default function AdminModerationQueuePage() {
  const form = useForm<ModerationDecisionValues>({
    resolver: zodResolver(moderationDecisionSchema),
    defaultValues: {
      caseId: "MOD-2026-117",
      decision: "hide",
      rationale: "Temporary hide while doxxing risk is reviewed by moderator.",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Moderation Queue</h1>
        <p className="text-muted-foreground">Review reports and record moderation decisions: hide, remove, restrict, or clear.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Decision console</CardTitle>
          <CardDescription>UI-only moderation workflow mock aligned to governed outcomes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => console.log(values))} className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="caseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="MOD-2026-000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="decision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decision</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="hide">Hide</option>
                        <option value="remove">Remove</option>
                        <option value="restrict">Restrict</option>
                        <option value="clear">Clear</option>
                      </select>
                    </FormControl>
                    <FormDescription>Decision outcomes mirror moderation governance states.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rationale"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Decision rationale</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Record policy-aligned decision reasoning..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <Button type="submit">Record moderation outcome</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open and recent cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {moderationCases.map((item) => (
            <div key={item.caseId} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{item.caseId} · {item.targetType}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={item.thresholdHidden ? "destructive" : "secondary"}>{item.thresholdHidden ? "Threshold hidden" : "Under review"}</Badge>
                  <Badge variant="outline">{item.decision}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{item.targetLabel} · Reports {item.reportCount} · {item.rationale}</p>
              <p className="text-xs text-muted-foreground">Decided by {item.decidedBy} at {item.decidedAt}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const submissionSchema = z.object({
  procedureCode: z.string().min(3, "Procedure code is required."),
  documentCount: z.coerce.number().min(1, "At least one document is required."),
});

type SubmissionValues = z.infer<typeof submissionSchema>;

export default function InstitutionalDashboardPage() {
  const form = useForm<SubmissionValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      procedureCode: "LA-2026",
      documentCount: 1,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Institutional Dashboard</h1>
        <p className="text-muted-foreground">Official procedures and submissions stay separated from social discovery.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Official Submission Draft</CardTitle>
          <CardDescription>React Hook Form + Zod setup for institutional procedure flows.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => console.log(values))}>
              <FormField
                control={form.control}
                name="procedureCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Procedure code</FormLabel>
                    <FormControl>
                      <Input placeholder="LA-2026" {...field} />
                    </FormControl>
                    <FormDescription>Institutional identifier for the active procedure.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documentCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document count</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormDescription>Total mandatory files attached by student.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <Button type="submit">Validate draft</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

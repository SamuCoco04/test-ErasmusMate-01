"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { roleAssignments } from "@/lib/mock/admin-governance";

const roleActionSchema = z.object({
  userId: z.string().min(3, "User ID is required."),
  role: z.string().min(3, "Role is required."),
  action: z.enum(["assign", "revoke"]),
  rationale: z.string().min(8, "Rationale is required for traceability."),
});

type RoleActionValues = z.infer<typeof roleActionSchema>;

export default function AdminUserManagementPage() {
  const form = useForm<RoleActionValues>({
    resolver: zodResolver(roleActionSchema),
    defaultValues: {
      userId: "USR-3890",
      role: "Community Moderator",
      action: "revoke",
      rationale: "Multiple moderation escalations require temporary revocation.",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">User Management</h1>
        <p className="text-muted-foreground">Role assignment and revocation are administrator-governed institutional actions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role assignment / revocation</CardTitle>
          <CardDescription>UI-only governance action mock with mandatory rationale.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => console.log(values))} className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="USR-0000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Coordinator" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="assign">Assign role</option>
                        <option value="revoke">Revoke role</option>
                      </select>
                    </FormControl>
                    <FormDescription>Only explicit administrator actions are permitted.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rationale"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Governance rationale</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Explain why this role action is required..."
                      />
                    </FormControl>
                    <FormDescription>Recorded for immutable-style audit traceability.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <Button type="submit">Record governance action</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current role assignments</CardTitle>
          <CardDescription>Institution and destination-bounded access only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {roleAssignments.map((account) => (
            <div key={account.userId} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{account.name} · {account.userId}</p>
                <Badge variant={account.status === "active" ? "secondary" : "destructive"}>{account.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{account.institution} · Scope: {account.destinationScope.join(", ")}</p>
              <p className="text-sm">Roles: {account.roles.join(", ")} · Last updated {account.lastUpdatedAt}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

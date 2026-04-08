"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { governanceKpis, incidentStatusCards, moderationCases, socialFeatureScopes } from "@/lib/mock/admin-governance";
import { mockFetchers } from "@/lib/query/mock-fetchers";
import { useMockQueryState } from "@/lib/query/use-mock-query-state";

const severityStyle = {
  high: "bg-rose-100 text-rose-800 border-rose-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  normal: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export default function AdminDashboardPage() {
  const mockState = useMockQueryState("adminDashboard");
  const { isLoading, isError, error } = useQuery({
    queryKey: ["institutionalOverview", "adminDashboard", mockState],
    queryFn: () => mockFetchers.institutionalOverview(mockState),
    retry: false,
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading administrator dashboard mock data…</p>;
  }

  if (isError) {
    return <p className="text-sm text-rose-700">Failed to load administrator dashboard mock data: {(error as Error).message}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Administrator Dashboard</h1>
        <p className="text-muted-foreground">Govern institutional controls, social-support boundaries, moderation outcomes, and operational integrity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>{governanceKpis.pendingModeration}</CardTitle><CardDescription>Pending moderation</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{governanceKpis.integrationIssues}</CardTitle><CardDescription>Integration issues</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{governanceKpis.activeUsers}</CardTitle><CardDescription>Active users</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{governanceKpis.systemUptime}</CardTitle><CardDescription>System uptime</CardDescription></CardHeader></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident & integration status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incidentStatusCards.map((incident) => (
            <div key={incident.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3">
              <div>
                <p className="font-medium">{incident.title}</p>
                <p className="text-sm text-muted-foreground">{incident.id} · {incident.detail}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={severityStyle[incident.severity]}>{incident.severity}</Badge>
                <Badge variant="outline">{incident.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Moderation queue snapshot</CardTitle>
            <CardDescription>Threshold and decision status for reported social entities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {moderationCases.map((item) => (
              <div key={item.caseId} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{item.caseId} · {item.targetType}</p>
                  <Badge variant={item.thresholdHidden ? "destructive" : "secondary"}>{item.thresholdHidden ? "Threshold hidden" : "Visible pending"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.targetLabel} · Decision: {item.decision}</p>
              </div>
            ))}
            <Link href="/admin/moderation-queue" className="inline-block text-sm text-blue-700 underline underline-offset-2">Open moderation queue</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social feature scoping snapshot</CardTitle>
            <CardDescription>Configuration remains secondary to institutional flows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {socialFeatureScopes.map((scope) => (
              <div key={scope.scopeId} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{scope.institution} · {scope.destination}</p>
                <p className="text-muted-foreground">{scope.mobilityStage} · {scope.userPopulation}</p>
                <p className="mt-1">Discoverability: {scope.discoverability ? "On" : "Off"} · Messaging: {scope.messaging ? "On" : "Off"}</p>
              </div>
            ))}
            <Link href="/admin/feature-scoping" className="inline-block text-sm text-blue-700 underline underline-offset-2">Manage feature scopes</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

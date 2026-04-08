import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { incidentStatusCards, moderationCases, roleAssignments } from "@/lib/mock/admin-governance";

const statusTone = {
  operational: "bg-emerald-100 text-emerald-800 border-emerald-200",
  degraded: "bg-amber-100 text-amber-800 border-amber-200",
  active: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Reports</h1>
        <p className="text-muted-foreground">Consolidated governance reporting for moderation, role governance, and integration health.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident & integration status cards</CardTitle>
          <CardDescription>Operational awareness for institutional administrators.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {incidentStatusCards.map((card) => (
            <div key={card.id} className="rounded-lg border bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{card.title}</p>
                <Badge className={statusTone[card.status as keyof typeof statusTone]}>{card.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{card.id}</p>
              <p className="mt-2 text-sm text-muted-foreground">{card.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Moderation outcomes summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Total cases shown: {moderationCases.length}</p>
            <p>Hidden outcomes: {moderationCases.filter((item) => item.decision === "hide").length}</p>
            <p>Restricted outcomes: {moderationCases.filter((item) => item.decision === "restrict").length}</p>
            <p>Cleared outcomes: {moderationCases.filter((item) => item.decision === "clear").length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role governance summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Governed accounts: {roleAssignments.length}</p>
            <p>Restricted accounts: {roleAssignments.filter((item) => item.status === "restricted").length}</p>
            <p>Accounts with elevated roles: {roleAssignments.filter((item) => item.roles.length > 1).length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

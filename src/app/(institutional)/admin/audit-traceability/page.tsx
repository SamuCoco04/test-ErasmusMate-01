import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { immutableAuditTimeline } from "@/lib/mock/admin-governance";

export default function AdminAuditTraceabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Audit & Traceability</h1>
        <p className="text-muted-foreground">Immutable-style audit timeline display for governance actions (UI-only mock).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Governance event timeline</CardTitle>
          <CardDescription>Events are listed newest-first with prior/new state hashes for traceability visualization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {immutableAuditTimeline.map((event) => (
            <div key={event.eventId} className="rounded-lg border bg-white p-3">
              <p className="font-medium">{event.eventId} · {event.action}</p>
              <p className="text-sm text-muted-foreground">{event.occurredAt} · Actor {event.actor} · Domain {event.domain}</p>
              <p className="text-sm">Target: {event.target}</p>
              <p className="text-xs text-muted-foreground">Prior hash {event.priorStateHash} → New hash {event.newStateHash}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

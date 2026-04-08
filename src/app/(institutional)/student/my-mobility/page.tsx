import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mobilityTimeline, myMobilityRecord } from "@/lib/mock/student-institutional";

const stateTone: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-300",
  submitted: "bg-sky-100 text-sky-800 border-sky-200",
  in_review: "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-violet-100 text-violet-800 border-violet-200",
  closed: "bg-zinc-100 text-zinc-700 border-zinc-300",
  terminated: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function StudentMyMobilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">My Mobility Record</h1>
        <p className="text-muted-foreground">Primary institutional lifecycle from draft through closure or exceptional termination.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{myMobilityRecord.id}</CardTitle>
          <CardDescription>
            {myMobilityRecord.homeInstitution} → {myMobilityRecord.hostInstitution}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mobilityTimeline.map((item) => (
              <div key={item.state} className="rounded-lg border bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Badge className={stateTone[item.state]}>{item.state}</Badge>
                  <span className="text-sm text-muted-foreground">{item.date}</span>
                </div>
                <p className="text-sm">{item.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { socialFeatureScopes } from "@/lib/mock/admin-governance";

const stageTone = {
  pre_departure: "bg-blue-100 text-blue-800 border-blue-200",
  during_mobility: "bg-emerald-100 text-emerald-800 border-emerald-200",
  end_of_mobility: "bg-violet-100 text-violet-800 border-violet-200",
};

export default function AdminFeatureScopingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Feature Scoping</h1>
        <p className="text-muted-foreground">Configure social-support scope by institution, destination, mobility stage, and user population.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Social-support scoping matrix</CardTitle>
          <CardDescription>Institutional core remains primary; this module only governs social layer exposure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {socialFeatureScopes.map((scope) => (
            <div key={scope.scopeId} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{scope.institution} · {scope.destination}</p>
                <Badge className={stageTone[scope.mobilityStage as keyof typeof stageTone]}>{scope.mobilityStage}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Population: {scope.userPopulation} · Scope ID: {scope.scopeId}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <Badge variant={scope.discoverability ? "secondary" : "outline"}>Discoverability {scope.discoverability ? "on" : "off"}</Badge>
                <Badge variant={scope.messaging ? "secondary" : "outline"}>Messaging {scope.messaging ? "on" : "off"}</Badge>
                <Badge variant={scope.mapExplorer ? "secondary" : "outline"}>Map explorer {scope.mapExplorer ? "on" : "off"}</Badge>
                <Badge variant={scope.recommendations ? "secondary" : "outline"}>Recommendations {scope.recommendations ? "on" : "off"}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Last configuration update: {scope.updatedAt}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

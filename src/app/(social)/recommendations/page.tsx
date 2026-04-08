"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBlockProfileMutation, useReportRecommendationMutation } from "@/lib/query/social-hooks";
import { useSocialStore } from "@/lib/state/social-store";

export default function RecommendationsPage() {
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const recommendations = useSocialStore((store) => store.recommendations);
  const profiles = useSocialStore((store) => store.profiles);

  const reportMutation = useReportRecommendationMutation();
  const blockMutation = useBlockProfileMutation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Recommendations & Tips</h1>
        <p className="text-muted-foreground">No generic social feed: this screen is limited to Erasmus support recommendations and practical tips.</p>
      </div>

      {banner && (
        <div className={`rounded-md border p-3 text-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{banner.message}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Moderation-aware Content States</CardTitle>
          <CardDescription>
            Content with high report volume is auto-obscured while awaiting moderator review (threshold behavior shown with mocked data).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((item) => (
            <div key={item.id} className="space-y-2 rounded-md border bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-900">{item.title}</p>
                <Badge variant={item.state === "published" ? "default" : "secondary"}>{item.state}</Badge>
              </div>
              <p className="text-muted-foreground">Category: {item.category}</p>
              <p className="text-muted-foreground">Reports: {item.reports}</p>
              <p className="text-muted-foreground">Author: {item.author}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={reportMutation.isPending}
                  onClick={async () => {
                    const result = await reportMutation.mutateAsync(item.id).catch((error: Error) => {
                      setBanner({ type: "error", message: error.message });
                      return null;
                    });
                    if (result) setBanner({ type: "success", message: result.details });
                  }}
                >
                  {reportMutation.isPending ? "Reporting..." : "Report"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={blockMutation.isPending}
                  onClick={async () => {
                    const profile = profiles.find((entry) => entry.name === item.author);
                    if (!profile) {
                      setBanner({ type: "error", message: "Author profile is not available for block action." });
                      return;
                    }
                    const result = await blockMutation.mutateAsync(profile.id).catch((error: Error) => {
                      setBanner({ type: "error", message: error.message });
                      return null;
                    });
                    if (result) setBanner({ type: "success", message: result.details });
                  }}
                >
                  {blockMutation.isPending ? "Blocking..." : "Block author"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

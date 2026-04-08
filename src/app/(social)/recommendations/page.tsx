import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { socialRecommendations } from "@/lib/mock/social-support";

export default function RecommendationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Recommendations & Tips</h1>
        <p className="text-muted-foreground">No generic social feed: this screen is limited to Erasmus support recommendations and practical tips.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moderation-aware Content States</CardTitle>
          <CardDescription>
            Content with high report volume is auto-obscured while awaiting moderator review (threshold behavior shown with mocked data).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {socialRecommendations.map((item) => (
            <div id={item.id} key={item.id} className="space-y-2 rounded-md border bg-white p-4 text-sm scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-900">{item.title}</p>
                <Badge variant={item.state === "published" ? "default" : "secondary"}>{item.state}</Badge>
              </div>
              <p className="text-muted-foreground">Category: {item.category}</p>
              <p className="text-muted-foreground">Reports: {item.reports}</p>
              <p className="text-muted-foreground">Author: {item.author}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Report
                </Button>
                <Button size="sm" variant="outline">
                  Block author
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

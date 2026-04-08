import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const mockStudents = ["Anna Kowalski", "Johan Andersson", "Sophie Laurent"];

export default function DiscoverPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Social Discover</h1>
        <p className="text-muted-foreground">Secondary support layer for peer matching (demo mocked data only).</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Discover Students</CardTitle>
          <CardDescription>Only social profiles appear here, never institutional procedure records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockStudents.map((student) => (
            <div key={student} className="rounded-md border bg-white p-3 text-sm">
              {student}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signatures } from "@/lib/mock/student-institutional";

export default function StudentSignaturesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Signatures</h1>
        <p className="text-muted-foreground">Signature-gated progression for official submissions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current signature stage</CardTitle>
          <CardDescription>Advancement is blocked until all required current-stage signatures are valid.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {signatures.map((signer) => (
            <div key={signer.role} className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div>
                <p className="font-medium">{signer.role}</p>
                <p className="text-sm text-muted-foreground">Signed at: {signer.date}</p>
              </div>
              <Badge
                className={
                  signer.status === "signed"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-amber-100 text-amber-800 border-amber-200"
                }
              >
                {signer.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

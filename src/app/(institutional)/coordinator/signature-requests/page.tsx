import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signatureRequests } from "@/lib/mock/coordinator-institutional";

export default function CoordinatorSignatureRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Signature Requests</h1>
        <p className="text-muted-foreground">Institutional signature obligations routed to participants in your assigned submissions.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Pending signature stages</CardTitle><CardDescription>Mocked coordinator-scoped signature requirement set.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {signatureRequests.map((req) => (
            <div key={req.id} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{req.id} · {req.studentName}</p>
              <p className="text-muted-foreground">Submission {req.submissionId} · {req.stage}</p>
              <p className="text-muted-foreground">Signer role: {req.signerRole} · Requested at: {req.requestedAt} · Status: {req.status}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

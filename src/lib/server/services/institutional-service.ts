import { serverMockDb } from "@/lib/server/mock-db";
import { DomainError } from "@/lib/server/http/response";

function assertInstitutionalResult(result: { outcome: "success" | "blocked"; details: string; data?: unknown }) {
  if (result.outcome === "success") {
    return result;
  }

  const details = result.details;
  if (/not found/i.test(details)) {
    throw new DomainError("NOT_FOUND", details);
  }

  if (/cannot submit without draft payload/i.test(details)) {
    throw new DomainError("PRECONDITION_FAILED", details);
  }

  throw new DomainError("CONFLICT", details);
}

export const institutionalServerService = {
  saveDraft(submissionId: string, draftPayload: Record<string, unknown>) {
    return assertInstitutionalResult(serverMockDb.saveDraft(submissionId, draftPayload));
  },
  submit(submissionId: string) {
    return assertInstitutionalResult(serverMockDb.submit(submissionId));
  },
  decision(submissionId: string, decision: "approved" | "rejected", rationale: string, actorId: string) {
    return assertInstitutionalResult(serverMockDb.decision(submissionId, decision, rationale, actorId));
  },
  reopen(submissionId: string, rationale: string, actorId: string) {
    return assertInstitutionalResult(serverMockDb.reopen(submissionId, rationale, actorId));
  },
  createException(input: {
    submissionId: string;
    requesterId: string;
    scope: "deadline" | "document_obligation" | "procedure_condition";
    rationale: string;
    requestedEffect: string;
  }) {
    return assertInstitutionalResult(serverMockDb.createException(input));
  },
  decideException(exceptionId: string, decision: "approved" | "rejected", rationale: string) {
    return assertInstitutionalResult(serverMockDb.decideException(exceptionId, decision, rationale));
  },
};

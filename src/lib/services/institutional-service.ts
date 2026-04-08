import { institutionalStore } from "@/lib/state/institutional-store";

export const institutionalService = {
  saveSubmissionDraft(submissionId: string, formPayload: Record<string, unknown>) {
    return institutionalStore.saveSubmissionDraft(submissionId, formPayload);
  },
  finalSubmit(submissionId: string) {
    return institutionalStore.finalSubmit(submissionId);
  },
  reviewApprove(submissionId: string, rationale: string, coordinatorId: string) {
    return institutionalStore.reviewApprove(submissionId, rationale, coordinatorId);
  },
  reviewReject(submissionId: string, rationale: string, coordinatorId: string) {
    return institutionalStore.reviewReject(submissionId, rationale, coordinatorId);
  },
  reviewReopen(submissionId: string, rationale: string, coordinatorId: string) {
    return institutionalStore.reviewReopen(submissionId, rationale, coordinatorId);
  },
  resubmitAfterRejection(submissionId: string, correctedPayload: Record<string, unknown>) {
    return institutionalStore.resubmitAfterRejection(submissionId, correctedPayload);
  },
  submitExceptionRequest(submissionId: string, rationale: string) {
    return institutionalStore.submitExceptionRequest(submissionId, rationale);
  },
  decideException(exceptionId: string, decision: "approved" | "rejected", rationale: string, coordinatorId: string) {
    return institutionalStore.decideException(exceptionId, decision, rationale, coordinatorId);
  },
};

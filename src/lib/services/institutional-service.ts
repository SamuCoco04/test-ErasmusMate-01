import { institutionalStore, type InstitutionalStoreState } from "@/lib/state/institutional-store";

const select = <T,>(selector: (state: InstitutionalStoreState) => T) => selector(institutionalStore.getState());

export const institutionalService = {
  selectors: {
    studentSubmissions() {
      return select((state) =>
        Object.values(state.submissions)
          .filter((submission) => submission.stage !== "Coordinator review")
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      );
    },
    coordinatorQueue() {
      return select((state) =>
        Object.values(state.submissions)
          .filter((submission) => ["submitted", "in_review", "resubmitted"].includes(submission.state))
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      );
    },
  },
  saveSubmissionDraft(submissionId: string, formPayload: Record<string, unknown>) {
    return institutionalStore.saveSubmissionDraft(submissionId, formPayload);
  },
  finalSubmit(submissionId: string) {
    return institutionalStore.finalSubmit(submissionId);
  },
  startReview(submissionId: string, coordinatorId: string) {
    return institutionalStore.startReview(submissionId, coordinatorId);
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
  createExceptionRequest({
    submissionId,
    scope,
    rationale,
    requestedEffect,
    coveredTargetId,
  }: {
    submissionId: string;
    scope: "deadline" | "document_obligation" | "procedure_condition";
    rationale: string;
    requestedEffect: string;
    coveredTargetId?: string;
  }) {
    return institutionalStore.createExceptionRequest({ submissionId, scope, rationale, requestedEffect, coveredTargetId });
  },
  startExceptionReview(exceptionId: string, coordinatorId: string) {
    return institutionalStore.startExceptionReview(exceptionId, coordinatorId);
  },
  approveException(exceptionId: string, rationale: string, coordinatorId: string) {
    return institutionalStore.approveException(exceptionId, rationale, coordinatorId);
  },
  rejectException(exceptionId: string, rationale: string, coordinatorId: string) {
    return institutionalStore.rejectException(exceptionId, rationale, coordinatorId);
  },
  applyApprovedException(exceptionId: string) {
    return institutionalStore.applyApprovedException(exceptionId);
  },
  closeAppliedException(exceptionId: string, actorId: string) {
    return institutionalStore.closeAppliedException(exceptionId, actorId);
  },
};

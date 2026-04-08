import { institutionalStore } from "@/lib/state/institutional-store";

export const institutionalService = {
  saveSubmissionDraft(submissionId: string, formPayload: Record<string, unknown>) {
    institutionalStore.saveSubmissionDraft(submissionId, formPayload);
  },
  finalSubmit(submissionId: string) {
    institutionalStore.finalSubmit(submissionId);
  },
  reviewApprove(submissionId: string, rationale: string, coordinatorId: string) {
    institutionalStore.reviewApprove(submissionId, rationale, coordinatorId);
  },
  reviewReject(submissionId: string, rationale: string, coordinatorId: string) {
    institutionalStore.reviewReject(submissionId, rationale, coordinatorId);
  },
  reviewReopen(submissionId: string, rationale: string, coordinatorId: string) {
    institutionalStore.reviewReopen(submissionId, rationale, coordinatorId);
  },
  resubmitAfterRejection(submissionId: string, correctedPayload: Record<string, unknown>) {
    institutionalStore.resubmitAfterRejection(submissionId, correctedPayload);
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
    institutionalStore.createExceptionRequest({ submissionId, scope, rationale, requestedEffect, coveredTargetId });
  },
  startExceptionReview(exceptionId: string, coordinatorId: string) {
    institutionalStore.startExceptionReview(exceptionId, coordinatorId);
  },
  approveException(exceptionId: string, rationale: string, coordinatorId: string) {
    institutionalStore.approveException(exceptionId, rationale, coordinatorId);
  },
  rejectException(exceptionId: string, rationale: string, coordinatorId: string) {
    institutionalStore.rejectException(exceptionId, rationale, coordinatorId);
  },
  applyApprovedException(exceptionId: string) {
    institutionalStore.applyApprovedException(exceptionId);
  },
};

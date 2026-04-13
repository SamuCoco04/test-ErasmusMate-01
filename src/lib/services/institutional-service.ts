import { USE_API } from "@/lib/config/feature-flags";
import { postApi } from "@/lib/services/api-client";
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
  async saveSubmissionDraft(submissionId: string, formPayload: Record<string, unknown>) {
    if (USE_API) return postApi(`/api/institutional/submissions/${submissionId}/draft`, { actorId: "student", draftPayload: formPayload });
    return institutionalStore.saveSubmissionDraft(submissionId, formPayload);
  },
  async finalSubmit(submissionId: string) {
    if (USE_API) return postApi(`/api/institutional/submissions/${submissionId}/submit`);
    return institutionalStore.finalSubmit(submissionId);
  },
  startReview(submissionId: string, coordinatorId: string) {
    return institutionalStore.startReview(submissionId, coordinatorId);
  },
  async reviewApprove(submissionId: string, rationale: string, coordinatorId: string) {
    if (USE_API) return postApi(`/api/institutional/submissions/${submissionId}/decision`, { actorId: coordinatorId, decision: "approved", rationale });
    return institutionalStore.reviewApprove(submissionId, rationale, coordinatorId);
  },
  async reviewReject(submissionId: string, rationale: string, coordinatorId: string) {
    if (USE_API) return postApi(`/api/institutional/submissions/${submissionId}/decision`, { actorId: coordinatorId, decision: "rejected", rationale });
    return institutionalStore.reviewReject(submissionId, rationale, coordinatorId);
  },
  async reviewReopen(submissionId: string, rationale: string, coordinatorId: string) {
    if (USE_API) return postApi(`/api/institutional/submissions/${submissionId}/reopen`, { actorId: coordinatorId, rationale });
    return institutionalStore.reviewReopen(submissionId, rationale, coordinatorId);
  },
  resubmitAfterRejection(submissionId: string, correctedPayload: Record<string, unknown>) {
    return institutionalStore.resubmitAfterRejection(submissionId, correctedPayload);
  },
  async createExceptionRequest({
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
    if (USE_API) {
      return postApi("/api/institutional/exceptions", {
        submissionId,
        requesterId: "student",
        scope,
        rationale,
        requestedEffect,
        coveredTargetId,
      });
    }
    return institutionalStore.createExceptionRequest({ submissionId, scope, rationale, requestedEffect, coveredTargetId });
  },
  startExceptionReview(exceptionId: string, coordinatorId: string) {
    return institutionalStore.startExceptionReview(exceptionId, coordinatorId);
  },
  async approveException(exceptionId: string, rationale: string, coordinatorId: string) {
    if (USE_API) return postApi(`/api/institutional/exceptions/${exceptionId}/decision`, { actorId: coordinatorId, decision: "approved", rationale });
    return institutionalStore.approveException(exceptionId, rationale, coordinatorId);
  },
  async rejectException(exceptionId: string, rationale: string, coordinatorId: string) {
    if (USE_API) return postApi(`/api/institutional/exceptions/${exceptionId}/decision`, { actorId: coordinatorId, decision: "rejected", rationale });
    return institutionalStore.rejectException(exceptionId, rationale, coordinatorId);
  },
  applyApprovedException(exceptionId: string) {
    return institutionalStore.applyApprovedException(exceptionId);
  },
  closeAppliedException(exceptionId: string, actorId: string) {
    return institutionalStore.closeAppliedException(exceptionId, actorId);
  },
};

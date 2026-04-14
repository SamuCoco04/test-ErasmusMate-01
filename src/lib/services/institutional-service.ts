import { INSTITUTIONAL_API_ENABLED } from "@/lib/config/feature-flags";
import type { ApiMutationResponse } from "@/lib/server/schemas/http";
import { postApi } from "@/lib/services/api-client";
import { institutionalStore, type InstitutionalStoreState } from "@/lib/state/institutional-store";

const select = <T,>(selector: (state: InstitutionalStoreState) => T) => selector(institutionalStore.getState());

async function runInstitutionalMutationWithFallback(
  apiCall: () => Promise<ApiMutationResponse>,
  fallback: () => ApiMutationResponse,
): Promise<ApiMutationResponse> {
  if (!INSTITUTIONAL_API_ENABLED) {
    return fallback();
  }

  const response = await apiCall();
  if (response.outcome === "success") {
    return response;
  }

  const apiDetails = response.details ?? "No additional details provided.";
  const fallbackResult = fallback();
  if (fallbackResult.outcome !== "success") {
    return {
      ...fallbackResult,
      details: `Institutional API failed (${apiDetails}) and fallback was also ${fallbackResult.outcome}: ${fallbackResult.details}`,
    };
  }
  return {
    ...fallbackResult,
    details: `Institutional API fallback applied: ${apiDetails}. ${fallbackResult.details}`,
    data: {
      fallbackApplied: true,
      apiDetails,
      originalData: response.data,
    },
  };
}

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
    return runInstitutionalMutationWithFallback(
      () => postApi(`/api/institutional/submissions/${submissionId}/draft`, { actorId: "student", draftPayload: formPayload }),
      () => institutionalStore.saveSubmissionDraft(submissionId, formPayload),
    );
  },
  async finalSubmit(submissionId: string) {
    return runInstitutionalMutationWithFallback(
      () => postApi(`/api/institutional/submissions/${submissionId}/submit`),
      () => institutionalStore.finalSubmit(submissionId),
    );
  },
  startReview(submissionId: string, coordinatorId: string) {
    return institutionalStore.startReview(submissionId, coordinatorId);
  },
  async reviewApprove(submissionId: string, rationale: string, coordinatorId: string) {
    return runInstitutionalMutationWithFallback(
      () => postApi(`/api/institutional/submissions/${submissionId}/decision`, { actorId: coordinatorId, decision: "approved", rationale }),
      () => institutionalStore.reviewApprove(submissionId, rationale, coordinatorId),
    );
  },
  async reviewReject(submissionId: string, rationale: string, coordinatorId: string) {
    return runInstitutionalMutationWithFallback(
      () => postApi(`/api/institutional/submissions/${submissionId}/decision`, { actorId: coordinatorId, decision: "rejected", rationale }),
      () => institutionalStore.reviewReject(submissionId, rationale, coordinatorId),
    );
  },
  async reviewReopen(submissionId: string, rationale: string, coordinatorId: string) {
    return runInstitutionalMutationWithFallback(
      () => postApi(`/api/institutional/submissions/${submissionId}/reopen`, { actorId: coordinatorId, rationale }),
      () => institutionalStore.reviewReopen(submissionId, rationale, coordinatorId),
    );
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
    return runInstitutionalMutationWithFallback(
      () =>
        postApi("/api/institutional/exceptions", {
          submissionId,
          requesterId: "student",
          scope,
          rationale,
          requestedEffect,
          coveredTargetId,
        }),
      () => institutionalStore.createExceptionRequest({ submissionId, scope, rationale, requestedEffect, coveredTargetId }),
    );
  },
  startExceptionReview(exceptionId: string, coordinatorId: string) {
    return institutionalStore.startExceptionReview(exceptionId, coordinatorId);
  },
  async approveException(exceptionId: string, rationale: string, coordinatorId: string) {
    return runInstitutionalMutationWithFallback(
      () => postApi(`/api/institutional/exceptions/${exceptionId}/decision`, { actorId: coordinatorId, decision: "approved", rationale }),
      () => institutionalStore.approveException(exceptionId, rationale, coordinatorId),
    );
  },
  async rejectException(exceptionId: string, rationale: string, coordinatorId: string) {
    return runInstitutionalMutationWithFallback(
      () => postApi(`/api/institutional/exceptions/${exceptionId}/decision`, { actorId: coordinatorId, decision: "rejected", rationale }),
      () => institutionalStore.rejectException(exceptionId, rationale, coordinatorId),
    );
  },
  applyApprovedException(exceptionId: string) {
    return institutionalStore.applyApprovedException(exceptionId);
  },
  closeAppliedException(exceptionId: string, actorId: string) {
    return institutionalStore.closeAppliedException(exceptionId, actorId);
  },
};

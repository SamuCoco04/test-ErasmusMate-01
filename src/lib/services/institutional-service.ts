import type { ExceptionState, SubmissionState } from "@prisma/client";

import type { ApiMutationResponse } from "@/lib/server/schemas/http";
import { getApi, postApi } from "@/lib/services/api-client";

type SubmissionReadModel = {
  id: string;
  state: SubmissionState;
  procedure: string;
  stage: string;
  dueDate: string;
  draftPayload?: Record<string, unknown>;
  submittedAt?: string | null;
  decisionRationale?: string | null;
  exceptionRequests?: Array<{ id: string; state: ExceptionState }>;
  auditEvents?: Array<{
    id: string;
    eventType: string;
    rationale?: string | null;
    priorState?: SubmissionState | null;
    newState?: SubmissionState | null;
    createdAt: string;
    actor?: { id: string; name: string };
  }>;
};

type ExceptionReadModel = {
  id: string;
  submissionId: string;
  state: ExceptionState;
  scope: "deadline" | "document_obligation" | "procedure_condition";
  rationale: string;
  requestedEffect: string;
  coveredTargetId?: string | null;
  decisionRationale?: string | null;
  appliedEffectSummary?: string | null;
};

const readData = async <T>(url: string): Promise<T> => {
  const response = await getApi<{ outcome?: string; data?: T; details?: string }>(url);
  if (response?.outcome === "success" && response.data) return response.data;
  throw new Error(response?.details ?? "Failed to fetch institutional data.");
};

export const institutionalService = {
  async listStudentSubmissions() {
    return readData<SubmissionReadModel[]>("/api/institutional/submissions?role=student");
  },
  async listCoordinatorQueue() {
    return readData<SubmissionReadModel[]>("/api/institutional/submissions?role=coordinator");
  },
  async listDeadlines() {
    return readData<Array<{ id: string; submissionId?: string; obligation: string; officialDueDate: string; effectiveDueDate: string; state: string; overrideBasis: string | null }>>(
      "/api/institutional/deadlines",
    );
  },
  async saveSubmissionDraft(submissionId: string, formPayload: Record<string, unknown>) {
    return postApi(`/api/institutional/submissions/${submissionId}/draft`, { actorId: "student", draftPayload: formPayload });
  },
  async finalSubmit(submissionId: string) {
    return postApi(`/api/institutional/submissions/${submissionId}/submit`, { actorId: "student" });
  },
  async startReview(submissionId: string, coordinatorId: string): Promise<ApiMutationResponse> {
    return postApi(`/api/institutional/submissions/${submissionId}/start-review`, { actorId: coordinatorId });
  },
  async reviewApprove(submissionId: string, rationale: string, coordinatorId: string) {
    return postApi(`/api/institutional/submissions/${submissionId}/decision`, { actorId: coordinatorId, decision: "approved", rationale });
  },
  async reviewReject(submissionId: string, rationale: string, coordinatorId: string) {
    return postApi(`/api/institutional/submissions/${submissionId}/decision`, { actorId: coordinatorId, decision: "rejected", rationale });
  },
  async reviewReopen(submissionId: string, rationale: string, coordinatorId: string) {
    return postApi(`/api/institutional/submissions/${submissionId}/reopen`, { actorId: coordinatorId, rationale });
  },
  async resubmitAfterRejection(submissionId: string, correctedPayload: Record<string, unknown>) {
    return postApi(`/api/institutional/submissions/${submissionId}/resubmit`, { actorId: "student", draftPayload: correctedPayload });
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
    return postApi("/api/institutional/exceptions", {
      submissionId,
      requesterId: "student",
      scope,
      rationale,
      requestedEffect,
      coveredTargetId,
    });
  },
  async startExceptionReview(exceptionId: string, coordinatorId: string) {
    return postApi(`/api/institutional/exceptions/${exceptionId}/start-review`, { actorId: coordinatorId });
  },
  async approveException(exceptionId: string, rationale: string, coordinatorId: string) {
    return postApi(`/api/institutional/exceptions/${exceptionId}/decision`, { actorId: coordinatorId, decision: "approved", rationale });
  },
  async rejectException(exceptionId: string, rationale: string, coordinatorId: string) {
    return postApi(`/api/institutional/exceptions/${exceptionId}/decision`, { actorId: coordinatorId, decision: "rejected", rationale });
  },
  async readSubmission(submissionId: string) {
    return readData<SubmissionReadModel>(`/api/institutional/submissions/${submissionId}/draft`);
  },
  async readExceptions(submissionId?: string) {
    const query = submissionId ? `?submissionId=${encodeURIComponent(submissionId)}` : "";
    return readData<ExceptionReadModel[]>(`/api/institutional/exceptions${query}`);
  },
  async applyApprovedException(exceptionId: string) {
    return postApi(`/api/institutional/exceptions/${exceptionId}/apply`, { actorId: "coord-anna-jensen" });
  },
  async closeAppliedException(exceptionId: string, actorId: string) {
    return postApi(`/api/institutional/exceptions/${exceptionId}/close`, { actorId });
  },
};

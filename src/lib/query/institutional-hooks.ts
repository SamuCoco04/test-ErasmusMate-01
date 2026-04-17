"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { institutionalService } from "@/lib/services/institutional-service";
import { assertOutcome, withLatency } from "@/lib/query/mutation-helpers";

export function useStudentSubmissionsQuery() {
  return useQuery({
    queryKey: ["institutional", "submissions", "student"],
    queryFn: () => institutionalService.listStudentSubmissions(),
  });
}

export function useCoordinatorQueueQuery() {
  return useQuery({
    queryKey: ["institutional", "submissions", "coordinator"],
    queryFn: () => institutionalService.listCoordinatorQueue(),
  });
}

export function useDeadlinesQuery() {
  return useQuery({
    queryKey: ["institutional", "deadlines"],
    queryFn: () => institutionalService.listDeadlines(),
  });
}

export function useSubmissionQuery(submissionId: string) {
  return useQuery({
    queryKey: ["institutional", "submission", submissionId],
    queryFn: () => institutionalService.readSubmission(submissionId),
    enabled: Boolean(submissionId),
  });
}

export function useExceptionsQuery(submissionId?: string) {
  return useQuery({
    queryKey: ["institutional", "exceptions", submissionId ?? "all"],
    queryFn: () => institutionalService.readExceptions(submissionId),
  });
}

const invalidateInstitutionalReadModels = (queryClient: ReturnType<typeof useQueryClient>, submissionId?: string) => {
  queryClient.invalidateQueries({ queryKey: ["institutional", "submissions"] });
  queryClient.invalidateQueries({ queryKey: ["institutional", "deadlines"] });
  queryClient.invalidateQueries({ queryKey: ["institutional", "exceptions"] });
  if (submissionId) {
    queryClient.invalidateQueries({ queryKey: ["institutional", "submission", submissionId] });
  }
};

export function useSaveSubmissionDraftMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => withLatency(async () => assertOutcome(await institutionalService.saveSubmissionDraft(submissionId, payload))),
    onSuccess: () => invalidateInstitutionalReadModels(queryClient, submissionId),
  });
}

export function useFinalSubmitMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => withLatency(async () => assertOutcome(await institutionalService.finalSubmit(submissionId))),
    onSuccess: () => invalidateInstitutionalReadModels(queryClient, submissionId),
  });
}

export function useResubmitAfterRejectionMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => withLatency(async () => assertOutcome(await institutionalService.resubmitAfterRejection(submissionId, payload))),
    onSuccess: () => invalidateInstitutionalReadModels(queryClient, submissionId),
  });
}

export function useReviewDecisionMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ decision, rationale, coordinatorId }: { decision: "approved" | "rejected" | "reopened"; rationale: string; coordinatorId: string }) =>
      withLatency(async () => {
        if (decision === "approved") return assertOutcome(await institutionalService.reviewApprove(submissionId, rationale, coordinatorId));
        if (decision === "rejected") return assertOutcome(await institutionalService.reviewReject(submissionId, rationale, coordinatorId));
        return assertOutcome(await institutionalService.reviewReopen(submissionId, rationale, coordinatorId));
      }),
    onSuccess: () => invalidateInstitutionalReadModels(queryClient, submissionId),
  });
}

export function useStartReviewMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (coordinatorId: string) => withLatency(async () => assertOutcome(await institutionalService.startReview(submissionId, coordinatorId))),
    onSuccess: () => invalidateInstitutionalReadModels(queryClient, submissionId),
  });
}

export function useCreateExceptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof institutionalService.createExceptionRequest>[0]) =>
      withLatency(async () => assertOutcome(await institutionalService.createExceptionRequest(payload))),
    onSuccess: () => invalidateInstitutionalReadModels(queryClient),
  });
}

export function useExceptionDecisionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ exceptionId, rationale, coordinatorId, decision }: { exceptionId: string; rationale: string; coordinatorId: string; decision: "approve" | "reject" | "start" | "apply" | "close" }) =>
      withLatency(async () => {
        if (decision === "start") return assertOutcome(await institutionalService.startExceptionReview(exceptionId, coordinatorId));
        if (decision === "approve") return assertOutcome(await institutionalService.approveException(exceptionId, rationale, coordinatorId));
        if (decision === "reject") return assertOutcome(await institutionalService.rejectException(exceptionId, rationale, coordinatorId));
        if (decision === "apply") return assertOutcome(await institutionalService.applyApprovedException(exceptionId, coordinatorId));
        return assertOutcome(await institutionalService.closeAppliedException(exceptionId, coordinatorId));
      }),
    onSuccess: () => invalidateInstitutionalReadModels(queryClient),
  });
}

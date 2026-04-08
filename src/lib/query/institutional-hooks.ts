"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { institutionalService } from "@/lib/services/institutional-service";

const delay = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

const withLatency = async <T,>(fn: () => T, ms?: number): Promise<T> => {
  await delay(ms);
  return fn();
};

const assertOutcome = (result: { outcome: "success" | "blocked"; details: string }) => {
  if (result.outcome === "blocked") {
    throw new Error(result.details);
  }
  return result;
};

export function useSaveSubmissionDraftMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => withLatency(() => assertOutcome(institutionalService.saveSubmissionDraft(submissionId, payload))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutional", "submission", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["institutional", "audit", submissionId] });
    },
  });
}

export function useFinalSubmitMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => withLatency(() => assertOutcome(institutionalService.finalSubmit(submissionId))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutional", "submission", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["institutional", "audit", submissionId] });
    },
  });
}

export function useResubmitAfterRejectionMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      withLatency(() => assertOutcome(institutionalService.resubmitAfterRejection(submissionId, payload))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutional", "submission", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["institutional", "audit", submissionId] });
    },
  });
}

export function useReviewDecisionMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ decision, rationale, coordinatorId }: { decision: "approved" | "rejected" | "reopened"; rationale: string; coordinatorId: string }) =>
      withLatency(() => {
        if (decision === "approved") return assertOutcome(institutionalService.reviewApprove(submissionId, rationale, coordinatorId));
        if (decision === "rejected") return assertOutcome(institutionalService.reviewReject(submissionId, rationale, coordinatorId));
        return assertOutcome(institutionalService.reviewReopen(submissionId, rationale, coordinatorId));
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutional", "submission", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["institutional", "audit", submissionId] });
    },
  });
}

export function useSubmitExceptionRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, rationale }: { submissionId: string; rationale: string }) =>
      withLatency(() => assertOutcome(institutionalService.submitExceptionRequest(submissionId, rationale))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutional", "exceptions"] });
    },
  });
}

export function useDecideExceptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ exceptionId, decision, rationale, coordinatorId }: { exceptionId: string; decision: "approved" | "rejected"; rationale: string; coordinatorId: string }) =>
      withLatency(() => assertOutcome(institutionalService.decideException(exceptionId, decision, rationale, coordinatorId))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutional", "exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["institutional", "audit"] });
    },
  });
}

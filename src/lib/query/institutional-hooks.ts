"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { institutionalService } from "@/lib/services/institutional-service";
import { assertOutcome, withLatency } from "@/lib/query/mutation-helpers";

export function useSaveSubmissionDraftMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => withLatency(async () => assertOutcome(await institutionalService.saveSubmissionDraft(submissionId, payload))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutional", "submission", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["institutional", "audit", submissionId] });
    },
  });
}

export function useFinalSubmitMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => withLatency(async () => assertOutcome(await institutionalService.finalSubmit(submissionId))),
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
      withLatency(async () => {
        if (decision === "approved") return assertOutcome(await institutionalService.reviewApprove(submissionId, rationale, coordinatorId));
        if (decision === "rejected") return assertOutcome(await institutionalService.reviewReject(submissionId, rationale, coordinatorId));
        return assertOutcome(await institutionalService.reviewReopen(submissionId, rationale, coordinatorId));
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutional", "submission", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["institutional", "audit", submissionId] });
    },
  });
}

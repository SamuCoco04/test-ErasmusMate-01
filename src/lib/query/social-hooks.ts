"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { socialService } from "@/lib/services/social-service";
import { assertOutcome, withLatency } from "@/lib/query/mutation-helpers";

export function useRequestConnectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => withLatency(() => assertOutcome(socialService.requestConnection(profileId))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "connections"] });
      queryClient.invalidateQueries({ queryKey: ["social", "discover"] });
    },
  });
}

export function useBlockProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => withLatency(() => assertOutcome(socialService.blockProfile(profileId))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "discover"] });
      queryClient.invalidateQueries({ queryKey: ["social", "connections"] });
    },
  });
}

export function useReportTargetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ targetId, reason }: { targetId: string; reason: string }) =>
      withLatency(() => assertOutcome(socialService.reportTarget(targetId, reason))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "moderation"] });
    },
  });
}

export function useBlockConnectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) => withLatency(() => assertOutcome(socialService.blockConnection(connectionId))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "connections"] });
      queryClient.invalidateQueries({ queryKey: ["social", "messages"] });
    },
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, message }: { threadId: string; message: string }) =>
      withLatency(() => assertOutcome(socialService.sendMessage(threadId, message))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "messages"] });
    },
  });
}

export function useReportRecommendationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recommendationId: string) => withLatency(() => assertOutcome(socialService.reportRecommendation(recommendationId))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "recommendations"] });
    },
  });
}

export function useReportMapMarkerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mapPinId, reason }: { mapPinId: string; reason: string }) =>
      withLatency(() => assertOutcome(socialService.reportMapMarker(mapPinId, reason))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "map"] });
      queryClient.invalidateQueries({ queryKey: ["social", "moderation"] });
    },
  });
}

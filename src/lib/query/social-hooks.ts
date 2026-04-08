"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { socialService } from "@/lib/services/social-service";
import { type ReportTargetType } from "@/lib/state/social-store";
import { withLatency } from "@/lib/query/mutation-helpers";

export function useSendConnectionRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetProfileId: string) => withLatency(() => socialService.sendConnectionRequest(targetProfileId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "connections"] });
      queryClient.invalidateQueries({ queryKey: ["social", "discover"] });
    },
  });
}

export function useAcceptConnectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) => withLatency(() => socialService.acceptConnection(connectionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "connections"] });
    },
  });
}

export function useRejectConnectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) => withLatency(() => socialService.rejectConnection(connectionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "connections"] });
    },
  });
}

export function useCancelConnectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) => withLatency(() => socialService.cancelConnection(connectionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "connections"] });
    },
  });
}

export function useBlockUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ peerId, reason }: { peerId: string; reason: string }) =>
      withLatency(() => socialService.blockUser(peerId, reason)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "connections"] });
      queryClient.invalidateQueries({ queryKey: ["social", "discover"] });
    },
  });
}

export function useReportEntityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { targetType: ReportTargetType; targetId: string; reason: string }) =>
      withLatency(() => socialService.reportEntity(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "moderation"] });
    },
  });
}

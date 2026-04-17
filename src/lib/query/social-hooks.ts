"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

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
    mutationFn: ({ peerId, reason, connectionId }: { peerId: string; reason: string; connectionId?: string }) =>
      withLatency(() => socialService.blockUser(peerId, reason, connectionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "connections"] });
      queryClient.invalidateQueries({ queryKey: ["social", "discover"] });
    },
  });
}

export function useReportEntityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { reporterProfileId?: string; targetType: ReportTargetType; targetId: string; reason: string }) =>
      withLatency(() => socialService.reportEntity(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "moderation"] });
    },
  });
}

export function useDiscoverProfilesQuery(actorProfileId: string) {
  return useQuery({
    queryKey: ["social", "discover", actorProfileId],
    queryFn: () => socialService.readDiscover(actorProfileId),
    enabled: Boolean(actorProfileId),
  });
}

export function useConnectionsQuery(profileId: string) {
  return useQuery({
    queryKey: ["social", "connections", profileId],
    queryFn: () => socialService.readConnections(profileId),
    enabled: Boolean(profileId),
  });
}

export function useMessagesQuery(profileId: string) {
  return useQuery({
    queryKey: ["social", "messages", profileId],
    queryFn: () => socialService.readMessages(profileId),
    enabled: Boolean(profileId),
  });
}

export function useContentQuery(filters?: { type?: string; category?: string; state?: string; authorId?: string; viewerId?: string }) {
  return useQuery({
    queryKey: ["social", "content", filters ?? {}],
    queryFn: () => socialService.readContent(filters),
  });
}

export function useMapQuery(filters?: {
  destinationCountry?: string;
  city?: string;
  category?: string;
  type?: string;
  minRating?: number;
  fromDate?: string;
  date?: string;
}) {
  return useQuery({
    queryKey: ["social", "map", filters ?? {}],
    queryFn: () => socialService.readMap(filters),
  });
}

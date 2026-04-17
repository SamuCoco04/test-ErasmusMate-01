import { getApi, patchApi, postApi, deleteApi } from "@/lib/services/api-client";

import type { ApiMutationResponse } from "@/lib/server/schemas/http";
import type { ReportTargetType } from "@/lib/state/social-store";
import type { ErasmusRelevantCategory, SocialContentType } from "@/lib/state/social-content-store";

type CreateSocialContentInput = {
  type: SocialContentType;
  authorId: string;
  authorName: string;
  category: ErasmusRelevantCategory;
  placeContext: {
    placeName: string;
    city: string;
    destinationCountry: string;
  };
  title: string;
  body: string;
};

type EditSocialContentInput = {
  actorId: string;
  type?: SocialContentType;
  category?: ErasmusRelevantCategory;
  placeContext?: {
    placeName: string;
    city: string;
    destinationCountry: string;
  };
  title?: string;
  body?: string;
};

const readData = async <T>(url: string): Promise<T> => {
  const response = await getApi<{ outcome?: string; data?: T; details?: string }>(url);
  if (response?.outcome === "success" && response.data !== undefined) return response.data;
  throw new Error(response?.details ?? `Failed to fetch social data from ${url}.`);
};

export const socialService = {
  async sendConnectionRequest(targetProfileId: string, requesterProfileId: string) {
    return postApi("/api/social/connections/request", {
      requesterProfileId,
      recipientProfileId: targetProfileId,
    });
  },
  async acceptConnection(connectionId: string, actorProfileId: string): Promise<ApiMutationResponse> {
    return postApi(`/api/social/connections/${connectionId}/respond`, {
      actorProfileId,
      action: "accepted",
    });
  },
  async rejectConnection(connectionId: string, actorProfileId: string): Promise<ApiMutationResponse> {
    return postApi(`/api/social/connections/${connectionId}/respond`, {
      actorProfileId,
      action: "rejected",
    });
  },
  async cancelConnection(connectionId: string, actorProfileId: string): Promise<ApiMutationResponse> {
    return postApi(`/api/social/connections/${connectionId}/respond`, {
      actorProfileId,
      action: "cancelled",
    });
  },
  async blockUser(connectionId: string, actorProfileId: string, reason: string): Promise<ApiMutationResponse> {
    return postApi(`/api/social/connections/${connectionId}/block`, {
      actorProfileId,
      reason,
    });
  },
  async reportEntity(input: { reporterProfileId: string; targetType: ReportTargetType; targetId: string; reason: string }) {
    return postApi("/api/social/reports", {
      reporterProfileId: input.reporterProfileId,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
    });
  },

  async createContent(input: CreateSocialContentInput) {
    return postApi("/api/social/content", input);
  },
  async editOwnContent(contentId: string, input: EditSocialContentInput) {
    return patchApi(`/api/social/content/${contentId}`, input);
  },
  async deleteOwnContent(contentId: string, actorId: string) {
    return deleteApi(`/api/social/content/${contentId}?actorId=${encodeURIComponent(actorId)}`);
  },
  async favorite(contentId: string, userId: string) {
    return postApi(`/api/social/content/${contentId}/favorite`, { userId });
  },
  async unfavorite(contentId: string, userId: string) {
    return deleteApi(`/api/social/content/${contentId}/favorite?userId=${encodeURIComponent(userId)}`);
  },

  async readConnections(profileId: string) {
    return readData<unknown>(`/api/social/connections/request?profileId=${encodeURIComponent(profileId)}`);
  },
  async readDiscover(actorProfileId: string) {
    return readData<unknown>(`/api/social/discover?actorProfileId=${encodeURIComponent(actorProfileId)}`);
  },
  async readMessages(profileId: string) {
    return readData<unknown>(`/api/social/messages?profileId=${encodeURIComponent(profileId)}`);
  },
  async readContent(filters?: { type?: string; category?: string; state?: string; authorId?: string; viewerId?: string }) {
    const params = new URLSearchParams();
    if (filters?.type) params.set("type", filters.type);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.state) params.set("state", filters.state);
    if (filters?.authorId) params.set("authorId", filters.authorId);
    if (filters?.viewerId) params.set("viewerId", filters.viewerId);

    const query = params.toString();
    return readData<unknown>(`/api/social/content${query ? `?${query}` : ""}`);
  },
  async readReports(targetType?: string) {
    const query = targetType ? `?targetType=${encodeURIComponent(targetType)}` : "";
    return readData<unknown>(`/api/social/reports${query}`);
  },
  async readMap(filters?: {
    destinationCountry?: string;
    city?: string;
    category?: string;
    type?: string;
    minRating?: number;
    fromDate?: string;
    date?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.destinationCountry) params.set("destinationCountry", filters.destinationCountry);
    if (filters?.city) params.set("city", filters.city);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.type) params.set("type", filters.type);
    if (typeof filters?.minRating === "number") params.set("minRating", String(filters.minRating));
    if (filters?.fromDate) params.set("fromDate", filters.fromDate);
    if (filters?.date) params.set("date", filters.date);

    const query = params.toString();
    return readData<unknown>(`/api/social/map${query ? `?${query}` : ""}`);
  },
};

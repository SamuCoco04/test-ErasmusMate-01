import { SOCIAL_API_ENABLED } from "@/lib/config/feature-flags";
import type { ApiMutationResponse } from "@/lib/server/schemas/http";
import { getApi, patchApi, postApi } from "@/lib/services/api-client";
import { socialContentStore, type ErasmusRelevantCategory, type SocialContentType } from "@/lib/state/social-content-store";
import { socialStore, type ReportTargetType } from "@/lib/state/social-store";

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

const successResult = (details: string, data?: unknown): ApiMutationResponse => ({
  outcome: "success",
  details,
  data,
});

const blockedResult = (details: string): ApiMutationResponse => ({
  outcome: "blocked",
  details,
});

async function runSocialMutation(
  apiCall: () => Promise<ApiMutationResponse>,
  fallback: () => ApiMutationResponse,
): Promise<ApiMutationResponse> {
  if (!SOCIAL_API_ENABLED) {
    try {
      return fallback();
    } catch (error) {
      return blockedResult(error instanceof Error ? error.message : "Fallback mutation failed.");
    }
  }

  return apiCall();
}

export const socialService = {
  // Connection lifecycle
  async sendConnectionRequest(targetProfileId: string) {
    return runSocialMutation(
      () =>
        postApi("/api/social/connections/request", {
        requesterProfileId: socialStore.getState().actorProfileId,
        recipientProfileId: targetProfileId,
        }),
      () => {
        const applied = socialStore.sendConnectionRequest(targetProfileId);
        return applied
          ? successResult("Connection request stored in mock social state.")
          : blockedResult("Connection request not applied: profile not found or active connection already exists.");
      },
    );
  },
  async acceptConnection(connectionId: string) {
    return runSocialMutation(
      () =>
        postApi(`/api/social/connections/${connectionId}/respond`, {
        actorProfileId: socialStore.getState().actorProfileId,
        action: "accepted",
        }),
      () => {
        socialStore.acceptConnection(connectionId);
        return successResult("Connection accepted in mock social state.");
      },
    );
  },
  async rejectConnection(connectionId: string) {
    return runSocialMutation(
      () =>
        postApi(`/api/social/connections/${connectionId}/respond`, {
        actorProfileId: socialStore.getState().actorProfileId,
        action: "rejected",
        }),
      () => {
        socialStore.rejectConnection(connectionId);
        return successResult("Connection rejected in mock social state.");
      },
    );
  },
  cancelConnection(connectionId: string) {
    socialStore.cancelConnection(connectionId);
  },
  async blockUser(peerId: string, reason: string) {
    const connectionId = socialStore.getState().connections.find((connection) => connection.peerProfileId === peerId)?.id;
    if (SOCIAL_API_ENABLED && !connectionId) return blockedResult("No connection found for target profile.");

    return runSocialMutation(
      () =>
        postApi(`/api/social/connections/${connectionId}/block`, {
          actorProfileId: socialStore.getState().actorProfileId,
          reason,
        }),
      () => {
        socialStore.blockUser(peerId, reason);
        return successResult("User blocked in mock social state.");
      },
    );
  },
  async reportEntity(input: { targetType: ReportTargetType; targetId: string; reason: string }) {
    return runSocialMutation(
      () =>
        postApi("/api/social/reports", {
        reporterId: socialStore.getState().actorProfileId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        }),
      () => {
        socialStore.reportEntity(input);
        return successResult("Social moderation report stored in mock state.");
      },
    );
  },
  canStartConnectionWith(profileId: string) {
    return socialStore.canStartConnectionWith(profileId);
  },
  canSendMessageToProfile(profileId: string) {
    return socialStore.canSendMessageToProfile(profileId);
  },

  // Recommendation/opinion lifecycle
  async createContent(input: CreateSocialContentInput) {
    return runSocialMutation(
      () => postApi("/api/social/content", input),
      () => {
        const data = socialContentStore.createContent(input);
        return successResult("Social content created in mock content store.", data);
      },
    );
  },
  async editOwnContent(contentId: string, input: EditSocialContentInput) {
    return runSocialMutation(
      () => patchApi(`/api/social/content/${contentId}`, input),
      () => {
        socialContentStore.editOwnContent(contentId, input);
        return successResult("Social content updated in mock content store.");
      },
    );
  },
  deleteOwnContent(contentId: string, actorId: string) {
    socialContentStore.deleteOwnContent(contentId, actorId);
  },
  async favorite(contentId: string, userId: string) {
    return runSocialMutation(
      () => postApi(`/api/social/content/${contentId}/favorite`, { userId }),
      () => {
        socialContentStore.addFavorite(contentId, userId);
        return successResult("Favorite mutation applied in mock content store.");
      },
    );
  },
  unfavorite(contentId: string, userId: string) {
    socialContentStore.removeFavorite(contentId, userId);
  },
  async reportContent(contentId: string, reason: string, reporterId?: string) {
    const contentItem = socialContentStore.getState().contentItems.find((item) => item.id === contentId);
    const targetType = contentItem?.type ?? "recommendation";
    return runSocialMutation(
      () =>
        postApi("/api/social/reports", {
        reporterId: reporterId ?? socialStore.getState().actorProfileId,
          targetType,
        targetId: contentId,
        reason,
        }),
      () => {
        socialContentStore.reportContent(contentId, reason, reporterId);
        return successResult("Social content report stored in mock content store.");
      },
    );
  },
  async readConnections(profileId: string) {
    if (!SOCIAL_API_ENABLED) {
      return socialStore.getState().connections;
    }
    const response = await getApi<{ outcome?: string; data?: unknown }>(
      `/api/social/connections/request?profileId=${encodeURIComponent(profileId)}`,
    );
    if (response?.outcome === "success") return response.data;
    return socialStore.getState().connections;
  },
  async readContent(filters?: { type?: string; category?: string; state?: string; authorId?: string }) {
    if (!SOCIAL_API_ENABLED) {
      return socialContentStore.getState().contentItems;
    }
    const params = new URLSearchParams();
    if (filters?.type) params.set("type", filters.type);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.state) params.set("state", filters.state);
    if (filters?.authorId) params.set("authorId", filters.authorId);

    const query = params.toString();
    const response = await getApi<{ outcome?: string; data?: unknown }>(`/api/social/content${query ? `?${query}` : ""}`);
    if (response?.outcome === "success") return response.data;
    return socialContentStore.getState().contentItems;
  },
  async readReports(targetType?: string) {
    if (!SOCIAL_API_ENABLED) {
      return socialStore.getState().moderationReports;
    }
    const query = targetType ? `?targetType=${encodeURIComponent(targetType)}` : "";
    const response = await getApi<{ outcome?: string; data?: unknown }>(`/api/social/reports${query}`);
    if (response?.outcome === "success") return response.data;
    return socialStore.getState().moderationReports;
  },
};

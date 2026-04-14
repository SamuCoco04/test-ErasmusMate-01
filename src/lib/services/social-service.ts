import { SOCIAL_API_ENABLED } from "@/lib/config/feature-flags";
import type { ApiMutationResponse } from "@/lib/server/schemas/http";
import { patchApi, postApi } from "@/lib/services/api-client";
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

async function runSocialMutationWithFallback(
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

  const response = await apiCall();
  if (response.outcome === "success") {
    return response;
  }

  const responseDetails =
    typeof response.details === "string" && response.details.trim().length > 0
      ? response.details
      : "Social API request did not provide additional details";

  try {
    const fallbackResult = fallback();
    if (fallbackResult.outcome !== "success") {
      return blockedResult(
        `Social API failed (${responseDetails}) and fallback was also blocked: ${fallbackResult.details ?? "no details"}`,
      );
    }
    return successResult(
      `Social API fallback applied: ${responseDetails}. ${fallbackResult.details}`,
      fallbackResult.data,
    );
  } catch (error) {
    return blockedResult(error instanceof Error ? error.message : "Fallback mutation failed.");
  }
}

export const socialService = {
  // Connection lifecycle
  async sendConnectionRequest(targetProfileId: string) {
    return runSocialMutationWithFallback(
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
    return runSocialMutationWithFallback(
      () =>
        postApi(`/api/social/connections/${connectionId}/respond`, {
        actorProfileId: socialStore.getState().actorProfileId,
        action: "accepted",
        }),
      () => { socialStore.acceptConnection(connectionId); return successResult("Connection accepted in mock social state."); },
    );
  },
  async rejectConnection(connectionId: string) {
    return runSocialMutationWithFallback(
      () =>
        postApi(`/api/social/connections/${connectionId}/respond`, {
        actorProfileId: socialStore.getState().actorProfileId,
        action: "rejected",
        }),
      () => { socialStore.rejectConnection(connectionId); return successResult("Connection rejected in mock social state."); },
    );
  },
  cancelConnection(connectionId: string) {
    socialStore.cancelConnection(connectionId);
  },
  async blockUser(peerId: string, reason: string) {
    const connectionId = socialStore.getState().connections.find((connection) => connection.peerProfileId === peerId)?.id;
    if (SOCIAL_API_ENABLED && !connectionId) return blockedResult("No connection found for target profile.");

    return runSocialMutationWithFallback(
      () =>
        postApi(`/api/social/connections/${connectionId}/block`, {
          actorProfileId: socialStore.getState().actorProfileId,
          reason,
        }),
      () => { socialStore.blockUser(peerId, reason); return successResult("User blocked in mock social state."); },
    );
  },
  async reportEntity(input: { targetType: ReportTargetType; targetId: string; reason: string }) {
    return runSocialMutationWithFallback(
      () =>
        postApi("/api/social/reports", {
        reporterId: socialStore.getState().actorProfileId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        }),
      () => { socialStore.reportEntity(input); return successResult("Social moderation report stored in mock state."); },
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
    return runSocialMutationWithFallback(
      () => postApi("/api/social/content", input),
      () => {
        const data = socialContentStore.createContent(input);
        return successResult("Social content created in mock content store.", data);
      },
    );
  },
  async editOwnContent(contentId: string, input: EditSocialContentInput) {
    return runSocialMutationWithFallback(
      () => patchApi(`/api/social/content/${contentId}`, input),
      () => { socialContentStore.editOwnContent(contentId, input); return successResult("Social content updated in mock content store."); },
    );
  },
  deleteOwnContent(contentId: string, actorId: string) {
    socialContentStore.deleteOwnContent(contentId, actorId);
  },
  async favorite(contentId: string, userId: string) {
    return runSocialMutationWithFallback(
      () => postApi(`/api/social/content/${contentId}/favorite`, { userId }),
      () => { socialContentStore.addFavorite(contentId, userId); return successResult("Favorite mutation applied in mock content store."); },
    );
  },
  unfavorite(contentId: string, userId: string) {
    socialContentStore.removeFavorite(contentId, userId);
  },
  async reportContent(contentId: string, reason: string, reporterId?: string) {
    const contentItem = socialContentStore.getState().contentItems.find((item) => item.id === contentId);
    const targetType = contentItem?.type ?? "recommendation";
    return runSocialMutationWithFallback(
      () =>
        postApi("/api/social/reports", {
        reporterId: reporterId ?? socialStore.getState().actorProfileId,
          targetType,
        targetId: contentId,
        reason,
        }),
      () => { socialContentStore.reportContent(contentId, reason, reporterId); return successResult("Social content report stored in mock content store."); },
    );
  },
};

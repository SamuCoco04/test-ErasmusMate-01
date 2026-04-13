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
  fallback: () => void | ApiMutationResponse | unknown,
  fallbackDetails: string,
): Promise<ApiMutationResponse> {
  if (!SOCIAL_API_ENABLED) {
    try {
      const data = fallback();
      return successResult(fallbackDetails, data);
    } catch (error) {
      return blockedResult(error instanceof Error ? error.message : "Fallback mutation failed.");
    }
  }

  const response = await apiCall();
  if (response.outcome === "success") {
    return response;
  }

  try {
    const data = fallback();
    return successResult(`Social API fallback applied: ${response.details}. ${fallbackDetails}`, data);
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
      () => socialStore.sendConnectionRequest(targetProfileId),
      "Connection request stored in mock social state.",
    );
  },
  async acceptConnection(connectionId: string) {
    return runSocialMutationWithFallback(
      () =>
        postApi(`/api/social/connections/${connectionId}/respond`, {
        actorProfileId: socialStore.getState().actorProfileId,
        action: "accepted",
        }),
      () => socialStore.acceptConnection(connectionId),
      "Connection accepted in mock social state.",
    );
  },
  async rejectConnection(connectionId: string) {
    return runSocialMutationWithFallback(
      () =>
        postApi(`/api/social/connections/${connectionId}/respond`, {
        actorProfileId: socialStore.getState().actorProfileId,
        action: "rejected",
        }),
      () => socialStore.rejectConnection(connectionId),
      "Connection rejected in mock social state.",
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
      () => socialStore.blockUser(peerId, reason),
      "User blocked in mock social state.",
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
      () => socialStore.reportEntity(input),
      "Social moderation report stored in mock state.",
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
      () => socialContentStore.createContent(input),
      "Social content created in mock content store.",
    );
  },
  async editOwnContent(contentId: string, input: EditSocialContentInput) {
    return runSocialMutationWithFallback(
      () => patchApi(`/api/social/content/${contentId}`, input),
      () => socialContentStore.editOwnContent(contentId, input),
      "Social content updated in mock content store.",
    );
  },
  deleteOwnContent(contentId: string, actorId: string) {
    socialContentStore.deleteOwnContent(contentId, actorId);
  },
  async favorite(contentId: string, userId: string) {
    return runSocialMutationWithFallback(
      () => postApi(`/api/social/content/${contentId}/favorite`, { userId }),
      () => socialContentStore.addFavorite(contentId, userId),
      "Favorite mutation applied in mock content store.",
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
      () => socialContentStore.reportContent(contentId, reason, reporterId),
      "Social content report stored in mock content store.",
    );
  },
};

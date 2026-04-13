import { USE_API } from "@/lib/config/feature-flags";
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

export const socialService = {
  // Connection lifecycle
  async sendConnectionRequest(targetProfileId: string) {
    if (USE_API) {
      const result = await postApi("/api/social/connections/request", {
        requesterProfileId: socialStore.getState().actorProfileId,
        recipientProfileId: targetProfileId,
      });
      if (result.outcome === "success") socialStore.sendConnectionRequest(targetProfileId);
      return result;
    }
    socialStore.sendConnectionRequest(targetProfileId);
  },
  async acceptConnection(connectionId: string) {
    if (USE_API) {
      const result = await postApi(`/api/social/connections/${connectionId}/respond`, {
        actorProfileId: socialStore.getState().actorProfileId,
        action: "accepted",
      });
      if (result.outcome === "success") socialStore.acceptConnection(connectionId);
      return result;
    }
    socialStore.acceptConnection(connectionId);
  },
  async rejectConnection(connectionId: string) {
    if (USE_API) {
      const result = await postApi(`/api/social/connections/${connectionId}/respond`, {
        actorProfileId: socialStore.getState().actorProfileId,
        action: "rejected",
      });
      if (result.outcome === "success") socialStore.rejectConnection(connectionId);
      return result;
    }
    socialStore.rejectConnection(connectionId);
  },
  cancelConnection(connectionId: string) {
    socialStore.cancelConnection(connectionId);
  },
  async blockUser(peerId: string, reason: string) {
    if (USE_API) {
      const connectionId = socialStore.getState().connections.find((connection) => connection.peerProfileId === peerId)?.id;
      if (!connectionId) return { outcome: "blocked" as const };
      const result = await postApi(`/api/social/connections/${connectionId}/block`, {
        actorProfileId: socialStore.getState().actorProfileId,
        reason,
      });
      if (result.outcome === "success") socialStore.blockUser(peerId, reason);
      return result;
    }
    socialStore.blockUser(peerId, reason);
  },
  async reportEntity(input: { targetType: ReportTargetType; targetId: string; reason: string }) {
    if (USE_API) {
      const result = await postApi("/api/social/reports", {
        reporterId: socialStore.getState().actorProfileId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
      });
      if (result.outcome === "success") socialStore.reportEntity(input);
      return result;
    }
    socialStore.reportEntity(input);
  },
  canStartConnectionWith(profileId: string) {
    return socialStore.canStartConnectionWith(profileId);
  },
  canSendMessageToProfile(profileId: string) {
    return socialStore.canSendMessageToProfile(profileId);
  },

  // Recommendation/opinion lifecycle
  async createContent(input: CreateSocialContentInput) {
    if (USE_API) {
      const result = await postApi("/api/social/content", input);
      if (result.outcome === "success") socialContentStore.createContent(input);
      return result;
    }
    return socialContentStore.createContent(input);
  },
  async editOwnContent(contentId: string, input: EditSocialContentInput) {
    if (USE_API) {
      const result = await patchApi(`/api/social/content/${contentId}`, input);
      if (result.outcome === "success") socialContentStore.editOwnContent(contentId, input);
      return result;
    }
    socialContentStore.editOwnContent(contentId, input);
  },
  deleteOwnContent(contentId: string, actorId: string) {
    socialContentStore.deleteOwnContent(contentId, actorId);
  },
  async favorite(contentId: string, userId: string) {
    if (USE_API) {
      const result = await postApi(`/api/social/content/${contentId}/favorite`, { userId });
      if (result.outcome === "success") socialContentStore.addFavorite(contentId, userId);
      return result;
    }
    socialContentStore.addFavorite(contentId, userId);
  },
  unfavorite(contentId: string, userId: string) {
    socialContentStore.removeFavorite(contentId, userId);
  },
  async reportContent(contentId: string, reason: string, reporterId?: string) {
    if (USE_API) {
      const contentItem = socialContentStore.getState().contentItems.find((item) => item.id === contentId);
      const targetType = contentItem?.type ?? "recommendation";
      const result = await postApi("/api/social/reports", {
        reporterId: reporterId ?? socialStore.getState().actorProfileId,
        targetType,
        targetId: contentId,
        reason,
      });
      if (result.outcome === "success") socialContentStore.reportContent(contentId, reason, reporterId);
      return result;
    }
    socialContentStore.reportContent(contentId, reason, reporterId);
  },
};

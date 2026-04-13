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
      return postApi("/api/social/connections/request", {
        requesterProfileId: socialStore.getState().actorProfileId,
        recipientProfileId: targetProfileId,
      });
    }
    socialStore.sendConnectionRequest(targetProfileId);
  },
  async acceptConnection(connectionId: string) {
    if (USE_API) {
      return postApi(`/api/social/connections/${connectionId}/respond`, {
        actorProfileId: socialStore.getState().actorProfileId,
        action: "accepted",
      });
    }
    socialStore.acceptConnection(connectionId);
  },
  async rejectConnection(connectionId: string) {
    if (USE_API) {
      return postApi(`/api/social/connections/${connectionId}/respond`, {
        actorProfileId: socialStore.getState().actorProfileId,
        action: "rejected",
      });
    }
    socialStore.rejectConnection(connectionId);
  },
  cancelConnection(connectionId: string) {
    socialStore.cancelConnection(connectionId);
  },
  async blockUser(peerId: string, reason: string) {
    if (USE_API) {
      const connectionId = socialStore.getState().connections.find((connection) => connection.peerProfileId === peerId)?.id;
      if (!connectionId) return;
      return postApi(`/api/social/connections/${connectionId}/block`, {
        actorProfileId: socialStore.getState().actorProfileId,
        reason,
      });
    }
    socialStore.blockUser(peerId, reason);
  },
  async reportEntity(input: { targetType: ReportTargetType; targetId: string; reason: string }) {
    if (USE_API) {
      return postApi("/api/social/reports", {
        reporterId: socialStore.getState().actorProfileId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
      });
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
    if (USE_API) return postApi("/api/social/content", input);
    return socialContentStore.createContent(input);
  },
  async editOwnContent(contentId: string, input: EditSocialContentInput) {
    if (USE_API) return patchApi(`/api/social/content/${contentId}`, input);
    socialContentStore.editOwnContent(contentId, input);
  },
  deleteOwnContent(contentId: string, actorId: string) {
    socialContentStore.deleteOwnContent(contentId, actorId);
  },
  async favorite(contentId: string, userId: string) {
    if (USE_API) return postApi(`/api/social/content/${contentId}/favorite`, { userId });
    socialContentStore.addFavorite(contentId, userId);
  },
  unfavorite(contentId: string, userId: string) {
    socialContentStore.removeFavorite(contentId, userId);
  },
  async reportContent(contentId: string, reason: string, reporterId?: string) {
    if (USE_API) {
      return postApi("/api/social/reports", {
        reporterId: reporterId ?? socialStore.getState().actorProfileId,
        targetType: "recommendation",
        targetId: contentId,
        reason,
      });
    }
    socialContentStore.reportContent(contentId, reason, reporterId);
  },
};

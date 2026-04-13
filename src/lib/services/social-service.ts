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
  sendConnectionRequest(targetProfileId: string) {
    socialStore.sendConnectionRequest(targetProfileId);
  },
  acceptConnection(connectionId: string) {
    socialStore.acceptConnection(connectionId);
  },
  rejectConnection(connectionId: string) {
    socialStore.rejectConnection(connectionId);
  },
  cancelConnection(connectionId: string) {
    socialStore.cancelConnection(connectionId);
  },
  blockUser(peerId: string, reason: string) {
    socialStore.blockUser(peerId, reason);
  },
  reportEntity(input: { targetType: ReportTargetType; targetId: string; reason: string }) {
    socialStore.reportEntity(input);
  },
  canStartConnectionWith(profileId: string) {
    return socialStore.canStartConnectionWith(profileId);
  },
  canSendMessageToProfile(profileId: string) {
    return socialStore.canSendMessageToProfile(profileId);
  },

  // Recommendation/opinion lifecycle
  createContent(input: CreateSocialContentInput) {
    return socialContentStore.createContent(input);
  },
  editOwnContent(contentId: string, input: EditSocialContentInput) {
    socialContentStore.editOwnContent(contentId, input);
  },
  deleteOwnContent(contentId: string, actorId: string) {
    socialContentStore.deleteOwnContent(contentId, actorId);
  },
  favorite(contentId: string, userId: string) {
    socialContentStore.addFavorite(contentId, userId);
  },
  unfavorite(contentId: string, userId: string) {
    socialContentStore.removeFavorite(contentId, userId);
  },
  reportContent(contentId: string, reason: string, reporterId?: string) {
    socialContentStore.reportContent(contentId, reason, reporterId);
  },
};

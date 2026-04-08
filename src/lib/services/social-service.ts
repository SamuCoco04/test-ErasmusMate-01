import { socialStore } from "@/lib/state/social-store";

export const socialService = {
  requestConnection(profileId: string) {
    return socialStore.requestConnection(profileId);
  },
  blockProfile(profileId: string) {
    return socialStore.blockProfile(profileId);
  },
  reportTarget(targetId: string, reason: string) {
    return socialStore.reportTarget(targetId, reason);
  },
  blockConnection(connectionId: string) {
    return socialStore.blockConnection(connectionId);
  },
  sendMessage(threadId: string, message: string) {
    return socialStore.sendMessage(threadId, message);
  },
  reportRecommendation(recommendationId: string) {
    return socialStore.reportRecommendation(recommendationId);
  },
  reportMapMarker(mapPinId: string, reason: string) {
    return socialStore.reportMapMarker(mapPinId, reason);
  },
};

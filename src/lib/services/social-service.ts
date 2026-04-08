import { socialStore } from "@/lib/state/social-store";

export const socialService = {
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
  reportEntity(input: { targetType: "social_profile" | "message" | "recommendation" | "opinion" | "social_interaction"; targetId: string; reason: string }) {
    socialStore.reportEntity(input);
  },
};

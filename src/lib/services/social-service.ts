import { socialStore, type ReportTargetType } from "@/lib/state/social-store";

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
  reportEntity(input: { targetType: ReportTargetType; targetId: string; reason: string }) {
    socialStore.reportEntity(input);
  },
};

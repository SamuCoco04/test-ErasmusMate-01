import { institutionalStore } from "@/lib/state/institutional-store";

export const institutionalService = {
  saveSubmissionDraft(submissionId: string, formPayload: Record<string, unknown>) {
    institutionalStore.saveSubmissionDraft(submissionId, formPayload);
  },
  finalSubmit(submissionId: string) {
    institutionalStore.finalSubmit(submissionId);
  },
  reviewApprove(submissionId: string, rationale: string, coordinatorId: string) {
    institutionalStore.reviewApprove(submissionId, rationale, coordinatorId);
  },
  reviewReject(submissionId: string, rationale: string, coordinatorId: string) {
    institutionalStore.reviewReject(submissionId, rationale, coordinatorId);
  },
  reviewReopen(submissionId: string, rationale: string, coordinatorId: string) {
    institutionalStore.reviewReopen(submissionId, rationale, coordinatorId);
  },
  resubmitAfterRejection(submissionId: string, correctedPayload: Record<string, unknown>) {
    institutionalStore.resubmitAfterRejection(submissionId, correctedPayload);
  },
};

import type { SocialConsent, VisibilityLevel } from "@/types/social";

export type SocialConsentFixture = {
  userId: string;
  consent: SocialConsent;
  visibility: VisibilityLevel;
};

export const socialConsentEdgeCasesFixture: SocialConsentFixture[] = [
  { userId: "SOC-STU-001", consent: { discoverabilityConsent: true, contactabilityConsent: true }, visibility: "erasmus_scope" },
  { userId: "SOC-STU-002", consent: { discoverabilityConsent: true, contactabilityConsent: false }, visibility: "connections_only" },
  { userId: "SOC-STU-003", consent: { discoverabilityConsent: false, contactabilityConsent: false, consentRevokedAt: "2026-04-02T14:20:00Z" }, visibility: "private" },
];

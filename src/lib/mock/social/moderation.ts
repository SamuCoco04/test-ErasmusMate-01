import type { SocialModerationCase } from "@/types/social";

export const socialModerationEdgeCasesFixture: SocialModerationCase[] = [
  { id: "MOD-EDGE-001", contentType: "recommendation", targetId: "REC-3", reason: "Possible personal address exposure", reports: 5, thresholdTriggered: true, outcome: "hide" },
  { id: "MOD-EDGE-002", contentType: "profile", targetId: "SOC-101", reason: "Repeated unsolicited contact requests", reports: 2, thresholdTriggered: false, outcome: "restrict" },
  { id: "MOD-EDGE-003", contentType: "opinion", targetId: "OPI-14", reason: "Disputed claim without policy breach", reports: 1, thresholdTriggered: false, outcome: "clear" },
];

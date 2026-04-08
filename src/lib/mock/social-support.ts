export type ConnectionState = "pending" | "accepted" | "rejected" | "cancelled" | "expired" | "blocked" | "closed";

export type SocialContentState = "draft" | "published" | "hidden" | "removed" | "auto_obscured_pending_review";

export type VisibilityLevel = "private" | "connections_only" | "erasmus_scope";

export type SocialConsentSettings = {
  discoverabilityConsent: boolean;
  contactabilityConsent: boolean;
  consentRevokedAt?: string;
};

export type SocialVisibilitySettings = {
  profileVisibility: VisibilityLevel;
  directContactExposed: boolean;
};

export type SocialProfile = {
  id: string;
  name: string;
  homeInstitution: string;
  destinationCity: string;
  interests: string[];
  consent: SocialConsentSettings;
  visibility: SocialVisibilitySettings;
};

export type SocialConnection = {
  id: string;
  peerName: string;
  state: ConnectionState;
  initiatedAt: string;
  respondedAt?: string;
};

export type MessageThread = {
  id: string;
  withUser: string;
  connectionState: ConnectionState;
  lastMessage: string;
  updatedAt: string;
};

export type RecommendationItem = {
  id: string;
  title: string;
  category: "housing" | "study" | "local_tip";
  reports: number;
  state: SocialContentState;
  author: string;
};

const MODERATION_AUTO_OBSCURE_THRESHOLD = 3;

export function applyModerationThreshold(recommendation: Omit<RecommendationItem, "state"> & { state: Exclude<SocialContentState, "auto_obscured_pending_review"> }): RecommendationItem {
  if (recommendation.reports >= MODERATION_AUTO_OBSCURE_THRESHOLD && recommendation.state === "published") {
    return { ...recommendation, state: "auto_obscured_pending_review" };
  }
  return recommendation;
}

export const socialProfiles: SocialProfile[] = [
  {
    id: "SOC-100",
    name: "Anna Kowalski",
    homeInstitution: "University of Warsaw",
    destinationCity: "Barcelona",
    interests: ["housing tips", "language exchange"],
    consent: { discoverabilityConsent: true, contactabilityConsent: true },
    visibility: { profileVisibility: "erasmus_scope", directContactExposed: true },
  },
  {
    id: "SOC-101",
    name: "Johan Andersson",
    homeInstitution: "Lund University",
    destinationCity: "Barcelona",
    interests: ["budget food", "transport"],
    consent: { discoverabilityConsent: true, contactabilityConsent: false },
    visibility: { profileVisibility: "connections_only", directContactExposed: false },
  },
  {
    id: "SOC-102",
    name: "Sophie Laurent",
    homeInstitution: "University of Lyon",
    destinationCity: "Barcelona",
    interests: ["course planning", "visa checklist"],
    consent: { discoverabilityConsent: false, contactabilityConsent: false, consentRevokedAt: "2026-04-02 14:20" },
    visibility: { profileVisibility: "private", directContactExposed: false },
  },
];

export const socialConnections: SocialConnection[] = [
  { id: "CON-1", peerName: "Anna Kowalski", state: "accepted", initiatedAt: "2026-04-01 09:00", respondedAt: "2026-04-01 11:15" },
  { id: "CON-2", peerName: "Johan Andersson", state: "pending", initiatedAt: "2026-04-06 10:30" },
  { id: "CON-3", peerName: "Luca Bianchi", state: "rejected", initiatedAt: "2026-03-30 17:55", respondedAt: "2026-03-31 08:40" },
  { id: "CON-4", peerName: "Marta Silva", state: "cancelled", initiatedAt: "2026-03-20 12:10", respondedAt: "2026-03-21 09:10" },
  { id: "CON-5", peerName: "Emre Kaya", state: "expired", initiatedAt: "2026-03-10 13:05", respondedAt: "2026-03-17 13:05" },
  { id: "CON-6", peerName: "Nora Weiss", state: "blocked", initiatedAt: "2026-02-28 16:20", respondedAt: "2026-03-01 10:04" },
  { id: "CON-7", peerName: "Iris van Dijk", state: "closed", initiatedAt: "2026-01-12 09:40", respondedAt: "2026-02-14 18:05" },
];

export const messageThreads: MessageThread[] = [
  {
    id: "THR-1",
    withUser: "Anna Kowalski",
    connectionState: "accepted",
    lastMessage: "I can share the housing checklist we used.",
    updatedAt: "2026-04-08 08:22",
  },
  {
    id: "THR-2",
    withUser: "Nora Weiss",
    connectionState: "blocked",
    lastMessage: "Thread locked by moderation.",
    updatedAt: "2026-04-07 19:04",
  },
  {
    id: "THR-3",
    withUser: "Johan Andersson",
    connectionState: "pending",
    lastMessage: "Messaging unavailable until request is accepted.",
    updatedAt: "2026-04-06 10:35",
  },
];

const baseRecommendations: Array<Omit<RecommendationItem, "state"> & { state: Exclude<SocialContentState, "auto_obscured_pending_review"> }> = [
  {
    id: "REC-1",
    title: "Verified dorms near Sant Antoni",
    category: "housing",
    reports: 0,
    state: "published",
    author: "Anna Kowalski",
  },
  {
    id: "REC-2",
    title: "Study room booking tip for UB libraries",
    category: "study",
    reports: 1,
    state: "hidden",
    author: "Johan Andersson",
  },
  {
    id: "REC-3",
    title: "Avoid posting landlord phone numbers publicly",
    category: "local_tip",
    reports: 4,
    state: "published",
    author: "Community Moderator",
  },
  {
    id: "REC-4",
    title: "Outdated metro pricing thread",
    category: "local_tip",
    reports: 2,
    state: "removed",
    author: "Admin Team",
  },
];

export const socialRecommendations: RecommendationItem[] = baseRecommendations.map(applyModerationThreshold);

export const socialProfileSettings = {
  discoverabilityConsent: true,
  contactabilityConsent: true,
  profileVisibility: "erasmus_scope" as VisibilityLevel,
  directContactExposed: false,
  blockedUsers: ["Nora Weiss"],
};

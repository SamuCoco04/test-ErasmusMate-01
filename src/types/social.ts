export type SocialRole = "student" | "coordinator" | "admin";
export type SocialConnectionState = "pending" | "accepted" | "rejected" | "cancelled" | "expired" | "blocked" | "closed";
export type SocialContentState = "draft" | "published" | "hidden" | "removed" | "auto_obscured_pending_review";
export type VisibilityLevel = "private" | "connections_only" | "erasmus_scope";
export type SocialContentType = "recommendation" | "opinion";
export type ErasmusRelevantCategory = "accommodation" | "transport" | "bureaucracy" | "academics" | "daily_living";

export type PlaceContext = {
  placeName: string;
  city: string;
  destinationCountry: string;
};

export type SocialContentItem = {
  id: string;
  type: SocialContentType;
  authorId: string;
  authorName: string;
  category: ErasmusRelevantCategory;
  placeContext: PlaceContext;
  title: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
  state: SocialContentState;
  reports: number;
  favoritesCount: number;
  moderationLocked: boolean;
  retentionLocked: boolean;
};

export type ModerationReport = {
  id: string;
  contentId: string;
  reporterId: string;
  reason: string;
  reportedAt: string;
};

export type SocialPersona = {
  id: string;
  role: SocialRole;
  fullName: string;
  homeInstitution: string;
  destination: string;
};

export type SocialConsent = {
  discoverabilityConsent: boolean;
  contactabilityConsent: boolean;
  consentRevokedAt?: string;
};

export type SocialModerationCase = {
  id: string;
  contentType: "recommendation" | "opinion" | "profile" | "message";
  targetId: string;
  reason: string;
  reports: number;
  thresholdTriggered: boolean;
  outcome: "hide" | "remove" | "restrict" | "clear";
};

export type SocialMapCategory = "accommodation" | "academics" | "bureaucracy" | "daily_living" | "transport";

export type MapLinkedOpinion = {
  id: string;
  placeName: string;
  city: string;
  destinationCountry: string;
  contentType: "recommendation" | "opinion";
  category: SocialMapCategory;
  rating: number;
  text: string;
  date: string;
  state: SocialContentState;
  latHint: number;
  lngHint: number;
  relatedContentId: string;
  relatedContentHref: string;
};

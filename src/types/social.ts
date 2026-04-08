export type SocialRole = "student" | "coordinator" | "admin";
export type SocialConnectionState = "pending" | "accepted" | "rejected" | "cancelled" | "expired" | "blocked" | "closed";
export type SocialContentState = "draft" | "published" | "hidden" | "removed" | "auto_obscured_pending_review";
export type VisibilityLevel = "private" | "connections_only" | "erasmus_scope";

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

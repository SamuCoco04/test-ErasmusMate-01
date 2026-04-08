"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  messageThreads,
  socialConnections,
  socialProfiles,
  socialRecommendations,
  type ConnectionState,
  type MessageThread,
  type RecommendationItem,
  type SocialConnection,
  type SocialProfile,
} from "@/lib/mock/social-support";

type ActionOutcome = "success" | "blocked";

type SocialAuditEntry = {
  id: string;
  actorId: string;
  action: string;
  targetId: string;
  outcome: ActionOutcome;
  details: string;
  timestamp: string;
};

export type SocialStoreState = {
  profiles: SocialProfile[];
  connections: SocialConnection[];
  messageThreads: MessageThread[];
  recommendations: RecommendationItem[];
  mapReports: Array<{ id: string; mapPinId: string; reason: string; status: "reported" }>;
  auditLog: SocialAuditEntry[];
};

const STORAGE_KEY = "erasmusmate.social-store.v1";

const initialState: SocialStoreState = {
  profiles: socialProfiles.map((item) => ({ ...item, consent: { ...item.consent }, visibility: { ...item.visibility } })),
  connections: socialConnections.map((item) => ({ ...item })),
  messageThreads: messageThreads.map((item) => ({ ...item })),
  recommendations: socialRecommendations.map((item) => ({ ...item })),
  mapReports: [],
  auditLog: [],
};

let state = initialState;
let hydrated = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const persistState = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence failures so in-memory state updates still render.
  }
};

const setState = (updater: (prev: SocialStoreState) => SocialStoreState) => {
  state = updater(state);
  persistState();
  notify();
};

const nowId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const createAudit = (payload: Omit<SocialAuditEntry, "id" | "timestamp">): SocialAuditEntry => ({
  ...payload,
  id: nowId("SOC-AUD"),
  timestamp: new Date().toISOString(),
});

const pushAudit = (entry: Omit<SocialAuditEntry, "id" | "timestamp">) => {
  setState((prev) => ({
    ...prev,
    auditLog: [createAudit(entry), ...prev.auditLog],
  }));
};

const updateConnectionState = (
  connectionId: string,
  nextState: ConnectionState,
  action: string,
  details: string,
): { outcome: ActionOutcome; details: string } => {
  const connection = state.connections.find((item) => item.id === connectionId);
  if (!connection) {
    const result = { outcome: "blocked" as const, details: "Connection not found." };
    pushAudit({ actorId: "student", action, targetId: connectionId, ...result });
    return result;
  }

  setState((prev) => ({
    ...prev,
    connections: prev.connections.map((item) =>
      item.id === connectionId
        ? {
            ...item,
            state: nextState,
            respondedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
          }
        : item,
    ),
    messageThreads: prev.messageThreads.map((thread) =>
      thread.withUser === connection.peerName ? { ...thread, connectionState: nextState } : thread,
    ),
    auditLog: [
      createAudit({ actorId: "student", action, targetId: connectionId, outcome: "success", details }),
      ...prev.auditLog,
    ],
  }));

  return { outcome: "success", details };
};

export const socialStore = {
  hydrate() {
    if (hydrated || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SocialStoreState;
        state = {
          ...initialState,
          ...parsed,
        };
      } catch {
        state = initialState;
      }
    }
    hydrated = true;
    notify();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getState() {
    return state;
  },
  requestConnection(profileId: string) {
    const profile = state.profiles.find((item) => item.id === profileId);
    if (!profile || !profile.consent.contactabilityConsent || !profile.visibility.directContactExposed) {
      const result = {
        outcome: "blocked" as const,
        details: "Connection request blocked by current consent/contactability settings.",
      };
      pushAudit({ actorId: "student", action: "request_connection", targetId: profileId, ...result });
      return result;
    }

    const result = { outcome: "success" as const, details: `Connection request sent to ${profile.name}.` };
    setState((prev) => ({
      ...prev,
      connections: [
        {
          id: nowId("CON"),
          peerName: profile.name,
          state: "pending",
          initiatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        },
        ...prev.connections,
      ],
      auditLog: [createAudit({ actorId: "student", action: "request_connection", targetId: profileId, ...result }), ...prev.auditLog],
    }));
    return result;
  },
  blockProfile(profileId: string) {
    const profile = state.profiles.find((item) => item.id === profileId);
    if (!profile) {
      const result = { outcome: "blocked" as const, details: "Profile not found." };
      pushAudit({ actorId: "student", action: "block_profile", targetId: profileId, ...result });
      return result;
    }

    const existingConnection = state.connections.find((connection) => connection.peerName === profile.name);
    if (existingConnection) {
      return updateConnectionState(existingConnection.id, "blocked", "block_profile", `${profile.name} has been blocked.`);
    }

    const result = { outcome: "success" as const, details: `${profile.name} has been blocked.` };
    pushAudit({ actorId: "student", action: "block_profile", targetId: profileId, ...result });
    return result;
  },
  reportTarget(targetId: string, reason: string) {
    const result = { outcome: "success" as const, details: "Report submitted for moderation review." };
    pushAudit({ actorId: "student", action: "report_target", targetId, ...result, details: `${result.details} Reason: ${reason}` });
    return result;
  },
  blockConnection(connectionId: string) {
    return updateConnectionState(connectionId, "blocked", "block_connection", "Connection has been blocked.");
  },
  sendMessage(threadId: string, message: string) {
    const thread = state.messageThreads.find((item) => item.id === threadId);
    if (!thread || thread.connectionState !== "accepted") {
      const result = { outcome: "blocked" as const, details: "Cannot send message unless connection is accepted." };
      pushAudit({ actorId: "student", action: "send_message", targetId: threadId, ...result });
      return result;
    }

    const result = { outcome: "success" as const, details: "Message sent." };
    setState((prev) => ({
      ...prev,
      messageThreads: prev.messageThreads.map((item) =>
        item.id === threadId
          ? {
              ...item,
              lastMessage: message,
              updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
            }
          : item,
      ),
      auditLog: [createAudit({ actorId: "student", action: "send_message", targetId: threadId, ...result }), ...prev.auditLog],
    }));
    return result;
  },
  reportRecommendation(recommendationId: string) {
    const recommendation = state.recommendations.find((item) => item.id === recommendationId);
    if (!recommendation) {
      const result = { outcome: "blocked" as const, details: "Recommendation not found." };
      pushAudit({ actorId: "student", action: "report_recommendation", targetId: recommendationId, ...result });
      return result;
    }

    const nextReports = recommendation.reports + 1;
    const nextState = nextReports >= 3 && recommendation.state === "published" ? "auto_obscured_pending_review" : recommendation.state;

    const result = {
      outcome: "success" as const,
      details:
        nextState === "auto_obscured_pending_review"
          ? "Report submitted; item auto-obscured pending moderation review."
          : "Report submitted for moderation review.",
    };

    setState((prev) => ({
      ...prev,
      recommendations: prev.recommendations.map((item) =>
        item.id === recommendationId
          ? {
              ...item,
              reports: nextReports,
              state: nextState,
            }
          : item,
      ),
      auditLog: [createAudit({ actorId: "student", action: "report_recommendation", targetId: recommendationId, ...result }), ...prev.auditLog],
    }));

    return result;
  },
  reportMapMarker(mapPinId: string, reason: string) {
    const result = { outcome: "success" as const, details: "Map item reported for moderation." };
    setState((prev) => ({
      ...prev,
      mapReports: [{ id: nowId("MAP-REP"), mapPinId, reason, status: "reported" }, ...prev.mapReports],
      auditLog: [createAudit({ actorId: "student", action: "report_map_marker", targetId: mapPinId, ...result }), ...prev.auditLog],
    }));
    return result;
  },
};

export const useSocialStore = <T,>(selector: (store: SocialStoreState) => T): T => {
  useEffect(() => {
    socialStore.hydrate();
  }, []);

  return useSyncExternalStore(socialStore.subscribe, () => selector(socialStore.getState()), () => selector(initialState));
};

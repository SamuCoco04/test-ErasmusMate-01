"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { messageThreads, socialConnections, socialProfiles, type ConnectionState } from "@/lib/mock/social-support";

const STORAGE_KEY = "erasmusmate.social-store.v1";
const ACTOR_PROFILE_ID = "ME-STUDENT";

export type ReportTargetType = "social_profile" | "message" | "recommendation" | "opinion" | "social_interaction";

export type SocialConnectionDirection = "incoming" | "outgoing";

export type SocialStoreConnection = {
  id: string;
  peerProfileId: string;
  peerName: string;
  state: ConnectionState;
  direction: SocialConnectionDirection;
  initiatedAt: string;
  respondedAt?: string;
  blockedReason?: string;
};

export type SocialStoreThread = {
  id: string;
  withProfileId: string;
  withUser: string;
  lastMessage: string;
  updatedAt: string;
};

export type SocialModerationReport = {
  id: string;
  reporterProfileId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  reportedAt: string;
};

export type SocialStoreState = {
  actorProfileId: string;
  connections: SocialStoreConnection[];
  threads: SocialStoreThread[];
  moderationReports: SocialModerationReport[];
};

const profileIdByName = Object.fromEntries(socialProfiles.map((profile) => [profile.name, profile.id]));

const toIso = (ts: string) => ts.replace(" ", "T");

const toProfileId = (name: string) => profileIdByName[name] ?? `PROFILE-${name.replace(/ /g, "-")}`;

const defaultDirectionByConnectionId: Record<string, SocialConnectionDirection> = {
  "CON-1": "incoming",
  "CON-2": "outgoing",
  "CON-3": "incoming",
  "CON-4": "outgoing",
  "CON-5": "incoming",
  "CON-6": "incoming",
  "CON-7": "outgoing",
};

const initialState: SocialStoreState = {
  actorProfileId: ACTOR_PROFILE_ID,
  connections: socialConnections.map((connection) => ({
    ...connection,
    peerProfileId: toProfileId(connection.peerName),
    direction: defaultDirectionByConnectionId[connection.id] ?? "outgoing",
    initiatedAt: toIso(connection.initiatedAt),
    respondedAt: connection.respondedAt ? toIso(connection.respondedAt) : undefined,
  })),
  threads: messageThreads.map((thread) => ({
    id: thread.id,
    withUser: thread.withUser,
    lastMessage: thread.lastMessage,
    updatedAt: thread.updatedAt,
    withProfileId: toProfileId(thread.withUser),
  })),
  moderationReports: [],
};

let state = initialState;
let hydrated = false;
const listeners = new Set<() => void>();
let devCycleGuard = {
  windowStart: 0,
  cycles: 0,
};

const DEV_GUARD_WINDOW_MS = 250;
const DEV_GUARD_THRESHOLD = 25;

const notify = () => {
  if (process.env.NODE_ENV !== "production") {
    const now = Date.now();
    if (now - devCycleGuard.windowStart > DEV_GUARD_WINDOW_MS) {
      devCycleGuard = { windowStart: now, cycles: 1 };
    } else {
      devCycleGuard.cycles += 1;
      if (devCycleGuard.cycles === DEV_GUARD_THRESHOLD) {
        console.warn(
          "[social-store] Potential repeated subscription cycle detected. Check selectors for derived arrays/objects created on every callback.",
        );
      }
    }
  }

  listeners.forEach((listener) => listener());
};

const persistState = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore local persistence errors and keep app state in memory.
  }
};

const setState = (updater: (prev: SocialStoreState) => SocialStoreState) => {
  const nextState = updater(state);
  if (Object.is(nextState, state)) return;
  state = nextState;
  persistState();
  notify();
};

const nowIso = () => new Date().toISOString();


const getLatestConnectionWithProfile = (snapshot: SocialStoreState, profileId: string) =>
  snapshot.connections
    .filter((connection) => connection.peerProfileId === profileId)
    .sort((a, b) => Date.parse(b.initiatedAt) - Date.parse(a.initiatedAt))[0];

const resolveConnectionStateForProfile = (snapshot: SocialStoreState, profileId: string): ConnectionState | "none" => {
  return getLatestConnectionWithProfile(snapshot, profileId)?.state ?? "none";
};

export const getMessagePermissionReason = (connectionState: ConnectionState | "none") => {
  switch (connectionState) {
    case "accepted":
      return "Messaging is enabled for accepted connections.";
    case "pending":
      return "Read-only: request is still pending acceptance.";
    case "rejected":
      return "Read-only: request was rejected.";
    case "cancelled":
      return "Read-only: request was cancelled before acceptance.";
    case "blocked":
      return "Read-only: one side blocked this relationship.";
    case "expired":
      return "Read-only: connection expired and messaging is retained only as history.";
    case "closed":
      return "Read-only: connection is closed and messaging is archived.";
    default:
      return "Read-only: no accepted connection exists.";
  }
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
          connections: parsed.connections ?? initialState.connections,
          threads: parsed.threads ?? initialState.threads,
          moderationReports: parsed.moderationReports ?? initialState.moderationReports,
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
  sendConnectionRequest(targetProfileId: string): boolean {
    const targetProfile = socialProfiles.find((profile) => profile.id === targetProfileId);

    if (!targetProfile) return false;

    let applied = false;
    setState((prev) => {
      const existing = getLatestConnectionWithProfile(prev, targetProfileId);
      if (existing && ["pending", "accepted", "blocked"].includes(existing.state)) return prev;

      applied = true;
      return {
        ...prev,
        connections: [
          {
            id: `CON-${Date.now()}`,
            peerProfileId: targetProfileId,
            peerName: targetProfile.name,
            state: "pending",
            direction: "outgoing",
            initiatedAt: nowIso(),
          },
          ...prev.connections,
        ],
      };
    });
    return applied;
  },
  acceptConnection(connectionId: string) {
    setState((prev) => ({
      ...prev,
      connections: prev.connections.map((connection) =>
        connection.id === connectionId && connection.state === "pending" && connection.direction === "incoming"
          ? { ...connection, state: "accepted", respondedAt: nowIso() }
          : connection,
      ),
    }));
  },
  rejectConnection(connectionId: string) {
    setState((prev) => ({
      ...prev,
      connections: prev.connections.map((connection) =>
        connection.id === connectionId && connection.state === "pending" && connection.direction === "incoming"
          ? { ...connection, state: "rejected", respondedAt: nowIso() }
          : connection,
      ),
    }));
  },
  cancelConnection(connectionId: string) {
    setState((prev) => ({
      ...prev,
      connections: prev.connections.map((connection) =>
        connection.id === connectionId && connection.state === "pending" && connection.direction === "outgoing"
          ? { ...connection, state: "cancelled", respondedAt: nowIso() }
          : connection,
      ),
    }));
  },
  blockUser(peerId: string, reason: string) {
    setState((prev) => {
      const existingConnection = prev.connections.find((connection) => connection.peerProfileId === peerId);
      if (existingConnection) {
        return {
          ...prev,
          connections: prev.connections.map((connection) =>
            connection.peerProfileId === peerId
              ? {
                  ...connection,
                  state: "blocked",
                  blockedReason: reason,
                  respondedAt: nowIso(),
                }
              : connection,
          ),
        };
      }

      const profile = socialProfiles.find((candidate) => candidate.id === peerId);
      if (!profile) return prev;

      return {
        ...prev,
        connections: [
          {
            id: `CON-${Date.now()}`,
            peerProfileId: profile.id,
            peerName: profile.name,
            state: "blocked",
            direction: "outgoing",
            initiatedAt: nowIso(),
            respondedAt: nowIso(),
            blockedReason: reason,
          },
          ...prev.connections,
        ],
      };
    });
  },
  reportEntity(input: { targetType: ReportTargetType; targetId: string; reason: string }) {
    setState((prev) => ({
      ...prev,
      moderationReports: [
        {
          id: `REPORT-${Date.now()}`,
          reporterProfileId: prev.actorProfileId,
          targetType: input.targetType,
          targetId: input.targetId,
          reason: input.reason,
          reportedAt: nowIso(),
        },
        ...prev.moderationReports,
      ],
    }));
  },
  canStartConnectionWith(profileId: string) {
    const connectionState = resolveConnectionStateForProfile(state, profileId);
    return connectionState !== "pending" && connectionState !== "accepted" && connectionState !== "blocked";
  },
  canSendMessageToProfile(profileId: string) {
    return resolveConnectionStateForProfile(state, profileId) === "accepted";
  },
  resolveThreadPermission(threadId: string) {
    const thread = state.threads.find((candidate) => candidate.id === threadId);
    if (!thread) return { connectionState: "none" as const, reason: getMessagePermissionReason("none") };

    const connectionState = resolveConnectionStateForProfile(state, thread.withProfileId);
    return {
      connectionState,
      reason: getMessagePermissionReason(connectionState),
    };
  },
};

export const useSocialStoreSnapshot = (): SocialStoreState => {
  useEffect(() => {
    socialStore.hydrate();
  }, []);

  return useSyncExternalStore(socialStore.subscribe, socialStore.getState, () => initialState);
};

export const useSocialStore = <T,>(
  selector: (snapshot: SocialStoreState) => T,
  isEqual: (left: T, right: T) => boolean = Object.is,
): T => {
  const snapshot = useSocialStoreSnapshot();
  const selected = selector(snapshot);
  const selectedRef = useRef(selected);

  if (!isEqual(selectedRef.current, selected)) {
    selectedRef.current = selected;
  }

  return selectedRef.current;
};

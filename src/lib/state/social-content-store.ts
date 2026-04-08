"use client";

import { useEffect, useSyncExternalStore } from "react";

import type {
  ErasmusRelevantCategory,
  ModerationReport,
  PlaceContext,
  SocialContentItem,
  SocialContentState,
  SocialContentType,
} from "@/types/social";

export type { ErasmusRelevantCategory, ModerationReport, PlaceContext, SocialContentType };

/** Backward-compatible alias. */
export type ContentItem = SocialContentItem;

export type SocialContentStoreState = {
  contentItems: SocialContentItem[];
  favoriteByUser: Record<string, string[]>;
  moderationReports: ModerationReport[];
};

type CreateContentPayload = {
  type: SocialContentType;
  authorId: string;
  authorName: string;
  category: ErasmusRelevantCategory;
  placeContext: PlaceContext;
  title: string;
  body: string;
};

type UpdateContentPayload = {
  type?: SocialContentType;
  category?: ErasmusRelevantCategory;
  placeContext?: PlaceContext;
  title?: string;
  body?: string;
  state?: SocialContentState;
};

const STORAGE_KEY = "erasmusmate.social-content-store.v1";
const AUTO_OBSCURE_REPORT_THRESHOLD = 3;

const genId = (prefix: string) => {
  const rand =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${rand}`;
};

const ALLOWED_CATEGORIES: ErasmusRelevantCategory[] = ["accommodation", "transport", "bureaucracy", "academics", "daily_living"];

const isValidPlaceContext = (context: PlaceContext) =>
  context.placeName.trim().length > 2 && context.city.trim().length > 1 && context.destinationCountry.trim().length > 1;

const assertErasmusContext = (category: ErasmusRelevantCategory, placeContext: PlaceContext) => {
  if (!ALLOWED_CATEGORIES.includes(category)) {
    throw new Error("Only Erasmus-relevant categories are allowed.");
  }

  if (!isValidPlaceContext(placeContext)) {
    throw new Error("Place context must include a valid place, city, and destination country.");
  }
};

const initialState: SocialContentStoreState = {
  contentItems: [
    {
      id: "CONT-001",
      type: "recommendation",
      authorId: "SOC-STU-002",
      authorName: "Anna Kowalski",
      category: "accommodation",
      placeContext: {
        placeName: "Sant Antoni Student Residence",
        city: "Barcelona",
        destinationCountry: "Spain",
      },
      title: "Verified dorms near Sant Antoni",
      body: "Ask for Erasmus contract addendum up front to speed up registration paperwork.",
      createdAt: "2026-04-03T09:10:00.000Z",
      state: "published",
      reports: 0,
      favoritesCount: 2,
      moderationLocked: false,
      retentionLocked: false,
    },
    {
      id: "CONT-002",
      type: "opinion",
      authorId: "SOC-STU-001",
      authorName: "Maria Rodriguez",
      category: "academics",
      placeContext: {
        placeName: "Universitat de Barcelona Main Library",
        city: "Barcelona",
        destinationCountry: "Spain",
      },
      title: "Study room booking tip for UB libraries",
      body: "Morning slots are easiest to reserve during orientation week.",
      createdAt: "2026-04-02T14:30:00.000Z",
      updatedAt: "2026-04-06T10:22:00.000Z",
      state: "hidden",
      reports: 1,
      favoritesCount: 5,
      moderationLocked: true,
      retentionLocked: false,
    },
    {
      id: "CONT-003",
      type: "recommendation",
      authorId: "SOC-STU-004",
      authorName: "Luca Bianchi",
      category: "bureaucracy",
      placeContext: {
        placeName: "Sants Mobility Office",
        city: "Barcelona",
        destinationCountry: "Spain",
      },
      title: "Queue early for residence certificate",
      body: "Bring passport + acceptance letter copy; they ask both at first desk.",
      createdAt: "2026-04-01T08:40:00.000Z",
      state: "published",
      reports: 2,
      favoritesCount: 1,
      moderationLocked: false,
      retentionLocked: false,
    },
    {
      id: "CONT-004",
      type: "opinion",
      authorId: "SOC-ADM-001",
      authorName: "Admin Team",
      category: "transport",
      placeContext: {
        placeName: "Barcelona Metro",
        city: "Barcelona",
        destinationCountry: "Spain",
      },
      title: "Outdated metro pricing thread",
      body: "Removed due to repeated inaccurate pricing information.",
      createdAt: "2026-03-30T17:00:00.000Z",
      state: "removed",
      reports: 2,
      favoritesCount: 0,
      moderationLocked: true,
      retentionLocked: true,
    },
  ],
  favoriteByUser: {
    "SOC-STU-001": ["CONT-001"],
    "SOC-STU-002": ["CONT-002", "CONT-003"],
  },
  moderationReports: [
    {
      id: "MR-001",
      contentId: "CONT-002",
      reporterId: "SOC-STU-008",
      reason: "Contains outdated study policy details.",
      reportedAt: "2026-04-06T10:30:00.000Z",
    },
    {
      id: "MR-002",
      contentId: "CONT-003",
      reporterId: "SOC-STU-006",
      reason: "Needs verification for document naming.",
      reportedAt: "2026-04-07T11:45:00.000Z",
    },
  ],
};

let state = initialState;
let hydrated = false;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const persistState = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence failures so local state updates still work.
  }
};

const setState = (updater: (prev: SocialContentStoreState) => SocialContentStoreState) => {
  state = updater(state);
  persistState();
  notify();
};

const ensureEditable = (item: SocialContentItem, actorId: string) => {
  if (item.authorId !== actorId) {
    throw new Error("You can only manage your own content.");
  }

  if (item.moderationLocked) {
    throw new Error("Content is moderation-locked and cannot be changed.");
  }

  if (item.retentionLocked) {
    throw new Error("Content is retention-locked and cannot be changed.");
  }
};

export const socialContentStore = {
  hydrate() {
    if (hydrated || typeof window === "undefined") return;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SocialContentStoreState;
        state = {
          contentItems: parsed.contentItems ?? initialState.contentItems,
          favoriteByUser: parsed.favoriteByUser ?? initialState.favoriteByUser,
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
  createContent(payload: CreateContentPayload) {
    assertErasmusContext(payload.category, payload.placeContext);

    const content: SocialContentItem = {
      id: genId("CONT"),
      ...payload,
      title: payload.title.trim(),
      body: payload.body.trim(),
      createdAt: new Date().toISOString(),
      state: "published",
      reports: 0,
      favoritesCount: 0,
      moderationLocked: false,
      retentionLocked: false,
    };

    setState((prev) => ({ ...prev, contentItems: [content, ...prev.contentItems] }));
    return content;
  },
  editOwnContent(contentId: string, payload: UpdateContentPayload & { actorId: string }) {
    const { actorId, ...updates } = payload;

    setState((prev) => ({
      ...prev,
      contentItems: prev.contentItems.map((item) => {
        if (item.id !== contentId) return item;
        ensureEditable(item, actorId);

        const nextCategory = updates.category ?? item.category;
        const nextPlaceContext = updates.placeContext ?? item.placeContext;
        assertErasmusContext(nextCategory, nextPlaceContext);

        return {
          ...item,
          ...updates,
          category: nextCategory,
          placeContext: nextPlaceContext,
          title: updates.title?.trim() ?? item.title,
          body: updates.body?.trim() ?? item.body,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },
  deleteOwnContent(contentId: string, actorId: string) {
    setState((prev) => ({
      ...prev,
      contentItems: prev.contentItems.map((item) => {
        if (item.id !== contentId) return item;
        ensureEditable(item, actorId);
        return {
          ...item,
          state: "removed",
          updatedAt: new Date().toISOString(),
          retentionLocked: true,
        };
      }),
    }));
  },
  toggleFavorite(contentId: string, userId: string) {
    setState((prev) => {
      const currentFavorites = prev.favoriteByUser[userId] ?? [];
      const alreadyFavorite = currentFavorites.includes(contentId);
      const nextFavorites = alreadyFavorite
        ? currentFavorites.filter((id) => id !== contentId)
        : [...currentFavorites, contentId];

      return {
        ...prev,
        favoriteByUser: {
          ...prev.favoriteByUser,
          [userId]: nextFavorites,
        },
        contentItems: prev.contentItems.map((item) => {
          if (item.id !== contentId) return item;
          return {
            ...item,
            favoritesCount: Math.max(0, item.favoritesCount + (alreadyFavorite ? -1 : 1)),
          };
        }),
      };
    });
  },
  reportContent(contentId: string, reason: string, reporterId = "SOC-STU-001") {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      throw new Error("Report reason is required.");
    }

    setState((prev) => {
      const report: ModerationReport = {
        id: genId("MR"),
        contentId,
        reporterId,
        reason: trimmedReason,
        reportedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        moderationReports: [report, ...prev.moderationReports],
        contentItems: prev.contentItems.map((item) => {
          if (item.id !== contentId) return item;
          const reports = item.reports + 1;
          const nextState =
            reports >= AUTO_OBSCURE_REPORT_THRESHOLD && item.state === "published"
              ? "auto_obscured_pending_review"
              : item.state;

          return {
            ...item,
            reports,
            state: nextState,
            moderationLocked: nextState !== "published",
          };
        }),
      };
    });
  },
};

export function useSocialContentStoreState() {
  useEffect(() => {
    socialContentStore.hydrate();
  }, []);

  return useSyncExternalStore(socialContentStore.subscribe, socialContentStore.getState, socialContentStore.getState);
}

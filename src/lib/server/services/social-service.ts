import type { ModerationTargetType, SocialConnectionState, SocialContentState, SocialContentType } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { DomainError } from "@/lib/server/http/response";
import { prisma } from "@/lib/server/prisma";

type ServiceResult<T = unknown> = { outcome: "success"; details: string; data?: T };
const ERASMUS_RELEVANT_CATEGORIES = ["accommodation", "transport", "bureaucracy", "academics", "daily_living"] as const;

const ensureContent = async (contentId: string) => {
  const content = await prisma.socialContent.findUnique({ where: { id: contentId } });
  if (!content) {
    throw new DomainError("NOT_FOUND", "Content not found.");
  }
  return content;
};

const ensureConnection = async (connectionId: string) => {
  const connection = await prisma.socialConnection.findUnique({ where: { id: connectionId } });
  if (!connection) {
    throw new DomainError("NOT_FOUND", "Connection not found.");
  }
  return connection;
};

const ensureUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new DomainError("NOT_FOUND", "User not found.");
  }
  return user;
};

const translateForeignKeyError = (error: unknown, message: string): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
    throw new DomainError("NOT_FOUND", message);
  }
  throw error;
};

export const socialServerService = {
  async createContent(input: {
    authorId: string;
    authorName?: string;
    type: "recommendation" | "opinion";
    category: "accommodation" | "transport" | "bureaucracy" | "academics" | "daily_living";
    title: string;
    body: string;
    placeContext?: unknown;
  }): Promise<ServiceResult> {
    const placeContext =
      input.placeContext && typeof input.placeContext === "object" && input.placeContext !== null
        ? (input.placeContext as Record<string, unknown>)
        : undefined;

    const created = await prisma.socialContent.create({
      data: {
        authorId: input.authorId,
        type: input.type,
        category: input.category,
        title: input.title,
        body: input.body,
        placeLabel: typeof placeContext?.label === "string" ? placeContext.label : null,
        placeCity: typeof placeContext?.city === "string" ? placeContext.city : null,
        placeCountry: typeof placeContext?.country === "string" ? placeContext.country : null,
      },
    });

    return { outcome: "success", details: "Content created.", data: created };
  },

  async patchContent(contentId: string, actorId: string, updates: Record<string, unknown>): Promise<ServiceResult> {
    const existing = await ensureContent(contentId);

    if (existing.authorId !== actorId) {
      throw new DomainError("FORBIDDEN", "Only author can edit content.");
    }

    const placeContext =
      updates.placeContext && typeof updates.placeContext === "object" && updates.placeContext !== null
        ? (updates.placeContext as Record<string, unknown>)
        : undefined;

    const updated = await prisma.socialContent.update({
      where: { id: contentId },
      data: {
        type: updates.type as SocialContentType | undefined,
        title: updates.title as string | undefined,
        body: updates.body as string | undefined,
        category: updates.category as string | undefined,
        placeLabel: typeof placeContext?.label === "string" ? placeContext.label : undefined,
        placeCity: typeof placeContext?.city === "string" ? placeContext.city : undefined,
        placeCountry: typeof placeContext?.country === "string" ? placeContext.country : undefined,
        state: "updated_visible",
      },
    });

    return { outcome: "success", details: "Content updated.", data: updated };
  },

  async favorite(contentId: string, userId: string): Promise<ServiceResult> {
    await ensureContent(contentId);
    await ensureUser(userId);

    await prisma.favorite.upsert({
      where: { userId_contentId: { userId, contentId } },
      create: { userId, contentId },
      update: {},
    });

    return { outcome: "success", details: "Content favorited.", data: { contentId, userId } };
  },

  async createConnection(requesterProfileId: string, recipientProfileId: string): Promise<ServiceResult> {
    try {
      const connection = await prisma.socialConnection.create({
        data: {
          requesterProfileId,
          recipientProfileId,
          state: "pending",
          messagingPermission: "not_permitted",
        },
      });

      return { outcome: "success", details: "Connection request sent.", data: connection };
    } catch (error) {
      return translateForeignKeyError(error, "One or both social profiles not found.");
    }
  },

  async respondConnection(connectionId: string, action: "accepted" | "rejected" | "cancelled", actorProfileId: string): Promise<ServiceResult> {
    const connection = await ensureConnection(connectionId);

    if (action === "cancelled") {
      if (connection.requesterProfileId !== actorProfileId) {
        throw new DomainError("FORBIDDEN", "Only the connection requester can cancel.");
      }
      if (connection.state !== "pending") {
        throw new DomainError("PRECONDITION_FAILED", "Only pending connections can be cancelled.");
      }
    } else if (connection.recipientProfileId !== actorProfileId) {
      throw new DomainError("FORBIDDEN", "Only the connection recipient can respond.");
    }

    const updated = await prisma.socialConnection.update({
      where: { id: connectionId },
      data: {
        state: action,
        respondedAt: new Date(),
        messagingPermission: action === "accepted" ? "permitted" : "not_permitted",
      },
    });

    return { outcome: "success", details: `Connection ${action}.`, data: updated };
  },

  async blockConnection(connectionId: string, reason: string, actorProfileId: string): Promise<ServiceResult> {
    const connection = await ensureConnection(connectionId);

    if (connection.requesterProfileId !== actorProfileId && connection.recipientProfileId !== actorProfileId) {
      throw new DomainError("FORBIDDEN", "Only a connection participant can block.");
    }

    const updated = await prisma.socialConnection.update({
      where: { id: connectionId },
      data: {
        state: "blocked",
        blockedByProfileId: actorProfileId,
        blockedReason: reason,
        messagingPermission: "blocked",
      },
    });

    return { outcome: "success", details: "Connection blocked.", data: updated };
  },

  async report(reporterProfileId: string, targetType: string, targetId: string, reason: string): Promise<ServiceResult> {
    const profile = await prisma.socialProfile.findUnique({ where: { id: reporterProfileId } });
    if (!profile) {
      throw new DomainError("NOT_FOUND", "Reporter social profile not found.");
    }

    const created = await prisma.moderationReport.create({
      data: {
        reporterId: profile.userId,
        targetType: targetType as ModerationTargetType,
        targetId,
        reason,
        contentId: ["recommendation", "opinion"].includes(targetType) ? targetId : null,
      },
    });

    return { outcome: "success", details: "Report created.", data: created };
  },

  async deleteContent(contentId: string, actorId: string): Promise<ServiceResult> {
    const existing = await ensureContent(contentId);
    if (existing.authorId !== actorId) {
      throw new DomainError("FORBIDDEN", "Only author can delete content.");
    }

    const deleted = await prisma.socialContent.update({
      where: { id: contentId },
      data: { state: "author_deleted" },
    });

    return { outcome: "success", details: "Content deleted.", data: deleted };
  },

  async unfavorite(contentId: string, userId: string): Promise<ServiceResult> {
    await ensureContent(contentId);
    await ensureUser(userId);

    await prisma.favorite.deleteMany({ where: { contentId, userId } });
    return { outcome: "success", details: "Content unfavorited.", data: { contentId, userId } };
  },

  async getContent(contentId: string): Promise<ServiceResult> {
    const content = await prisma.socialContent.findUnique({
      where: { id: contentId },
      include: {
        author: {
          select: { id: true, name: true },
        },
        _count: { select: { favorites: true, reports: true } },
      },
    });

    if (!content) {
      throw new DomainError("NOT_FOUND", "Content not found.");
    }

    return { outcome: "success", details: "Social content read model fetched.", data: content };
  },

  async listContent(filters: { type?: SocialContentType | "all"; category?: string; state?: SocialContentState | "all"; authorId?: string }): Promise<ServiceResult> {
    const content = await prisma.socialContent.findMany({
      where: {
        type: filters.type && filters.type !== "all" ? filters.type : undefined,
        category: filters.category,
        state: filters.state && filters.state !== "all" ? filters.state : undefined,
        authorId: filters.authorId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { favorites: true, reports: true } },
      },
    });

    return { outcome: "success", details: "Social content list read model fetched.", data: content };
  },

  async listConnections(filters: { profileId: string; state?: SocialConnectionState | "all" }): Promise<ServiceResult> {
    const connections = await prisma.socialConnection.findMany({
      where: {
        OR: [{ requesterProfileId: filters.profileId }, { recipientProfileId: filters.profileId }],
        state: filters.state && filters.state !== "all" ? filters.state : undefined,
      },
      orderBy: { createdAt: "desc" },
      include: {
        requester: {
          select: { id: true, displayName: true, user: { select: { id: true } } },
        },
        recipient: {
          select: { id: true, displayName: true, user: { select: { id: true } } },
        },
      },
    });

    return { outcome: "success", details: "Connection list read model fetched.", data: connections };
  },

  async listDiscoverProfiles(filters: { actorProfileId: string }): Promise<ServiceResult> {
    const discoverableProfiles = await prisma.socialProfile.findMany({
      where: {
        id: { not: filters.actorProfileId },
        discoverable: true,
      },
      select: {
        id: true,
        displayName: true,
        user: {
          select: {
            mobilityRecords: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { homeInstitution: true, destination: true },
            },
          },
        },
      },
      orderBy: { displayName: "asc" },
    });

    return {
      outcome: "success",
      details: "Discoverable social profiles fetched.",
      data: discoverableProfiles.map((profile) => {
        const context = profile.user.mobilityRecords[0];
        return {
          id: profile.id,
          name: profile.displayName,
          homeInstitution: context?.homeInstitution ?? "Institution not set",
          destinationCity: context?.destination ?? "Destination not set",
        };
      }),
    };
  },

  async listMessageThreads(filters: { profileId: string }): Promise<ServiceResult> {
    const connections = await prisma.socialConnection.findMany({
      where: {
        OR: [{ requesterProfileId: filters.profileId }, { recipientProfileId: filters.profileId }],
      },
      include: {
        requester: { select: { id: true, displayName: true } },
        recipient: { select: { id: true, displayName: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, body: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      outcome: "success",
      details: "Message thread permission read model fetched.",
      data: connections.map((connection) => {
        const isRequester = connection.requesterProfileId === filters.profileId;
        const peer = isRequester ? connection.recipient : connection.requester;
        const lastMessage = connection.messages[0];
        return {
          id: connection.id,
          withProfileId: peer.id,
          withUser: peer.displayName,
          connectionState: connection.state,
          lastMessage: lastMessage?.body ?? "No messages yet.",
          updatedAt: (lastMessage?.createdAt ?? connection.updatedAt).toISOString(),
        };
      }),
    };
  },

  async listMapContent(filters: {
    destinationCountry?: string;
    city?: string;
    category?: string;
    type?: "recommendation" | "opinion" | "all";
    minRating?: number;
    fromDate?: string;
    date?: string;
  }): Promise<ServiceResult> {
    const content = await prisma.socialContent.findMany({
      where: {
        state: { in: ["published_visible", "updated_visible"] },
        category:
          filters.category && filters.category !== "all" && ERASMUS_RELEVANT_CATEGORIES.includes(filters.category as (typeof ERASMUS_RELEVANT_CATEGORIES)[number])
            ? filters.category
            : undefined,
        type: filters.type && filters.type !== "all" ? filters.type : undefined,
        placeCity: filters.city ? { contains: filters.city } : undefined,
        placeCountry: filters.destinationCountry ? { contains: filters.destinationCountry } : undefined,
        placeLabel: { not: null },
      },
      include: {
        reports: { select: { id: true } },
        favorites: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapRows = content
      .filter((item) => item.placeLabel && item.placeCity && item.placeCountry)
      .map((item) => {
        const rating = Math.max(1, Math.min(5, 5 - item.reports.length * 0.2 + item.favorites.length * 0.1));
        return {
          id: item.id,
          placeName: item.placeLabel!,
          city: item.placeCity!,
          destinationCountry: item.placeCountry!,
          contentType: item.type,
          category: item.category,
          rating: Number(rating.toFixed(1)),
          text: item.body,
          date: item.createdAt.toISOString().slice(0, 10),
          state: item.state,
          latHint: Number(item.placeLatitude ?? 41.3874),
          lngHint: Number(item.placeLongitude ?? 2.1686),
          relatedContentId: item.id,
          relatedContentHref: `/recommendations#${item.id}`,
        };
      })
      .filter((item) => {
        const matchesMinRating = typeof filters.minRating === "number" ? item.rating >= filters.minRating : true;
        const matchesFromDate = filters.fromDate ? item.date >= filters.fromDate : true;
        const matchesDate = filters.date ? item.date === filters.date : true;
        return matchesMinRating && matchesFromDate && matchesDate;
      });

    return { outcome: "success", details: "Map discovery read model fetched.", data: mapRows };
  },

  async listReports(filters: { targetType?: ModerationTargetType | "all"; reporterId?: string }): Promise<ServiceResult> {
    const reports = await prisma.moderationReport.findMany({
      where: {
        targetType: filters.targetType && filters.targetType !== "all" ? filters.targetType : undefined,
        reporterId: filters.reporterId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { id: true, name: true } },
      },
    });

    return { outcome: "success", details: "Moderation reports list read model fetched.", data: reports };
  },
};

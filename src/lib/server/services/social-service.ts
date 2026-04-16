import { serverMockDb } from "@/lib/server/mock-db";
import { DomainError } from "@/lib/server/http/response";

function assertSocialResult(result: { outcome: "success" | "blocked"; details: string; data?: unknown }) {
  if (result.outcome === "success") {
    return result;
  }

  const details = result.details;
  if (/not found/i.test(details)) {
    throw new DomainError("NOT_FOUND", details);
  }

  if (/only author can edit content/i.test(details)) {
    throw new DomainError("FORBIDDEN", details);
  }

  throw new DomainError("CONFLICT", details);
}

export const socialServerService = {
  createContent(input: {
    authorId: string;
    authorName?: string;
    type: "recommendation" | "opinion";
    category: "accommodation" | "transport" | "bureaucracy" | "academics" | "daily_living";
    title: string;
    body: string;
    placeContext?: unknown;
  }) {
    return assertSocialResult(serverMockDb.createContent(input));
  },
  patchContent(contentId: string, actorId: string, updates: Record<string, unknown>) {
    return assertSocialResult(serverMockDb.patchContent(contentId, actorId, updates));
  },
  favorite(contentId: string, userId: string) {
    return assertSocialResult(serverMockDb.favorite(contentId, userId));
  },
  createConnection(requesterProfileId: string, recipientProfileId: string) {
    return assertSocialResult(serverMockDb.createConnection(requesterProfileId, recipientProfileId));
  },
  respondConnection(connectionId: string, action: "accepted" | "rejected") {
    return assertSocialResult(serverMockDb.respondConnection(connectionId, action));
  },
  blockConnection(connectionId: string, reason: string) {
    return assertSocialResult(serverMockDb.blockConnection(connectionId, reason));
  },
  report(reporterId: string, targetType: string, targetId: string, reason: string) {
    return assertSocialResult(serverMockDb.report(reporterId, targetType, targetId, reason));
  },
};

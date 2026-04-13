import { z } from "zod";

export const connectionRequestSchema = z.object({
  requesterProfileId: z.string().min(1),
  recipientProfileId: z.string().min(1),
});

export const connectionRespondSchema = z.object({
  actorProfileId: z.string().min(1),
  action: z.enum(["accepted", "rejected"]),
});

export const connectionBlockSchema = z.object({
  actorProfileId: z.string().min(1),
  reason: z.string().min(1),
});

export const socialContentCreateSchema = z.object({
  authorId: z.string().min(1),
  authorName: z.string().min(1).optional(),
  type: z.enum(["recommendation", "opinion"]),
  category: z.enum(["accommodation", "transport", "bureaucracy", "academics", "daily_living"]),
  title: z.string().min(3),
  body: z.string().min(3),
  placeContext: z.unknown().optional(),
});

export const socialContentPatchSchema = z.object({
  actorId: z.string().min(1),
  type: z.enum(["recommendation", "opinion"]).optional(),
  title: z.string().min(3).optional(),
  body: z.string().min(3).optional(),
  category: z.enum(["accommodation", "transport", "bureaucracy", "academics", "daily_living"]).optional(),
  placeContext: z.unknown().optional(),
});

export const socialFavoriteSchema = z.object({
  userId: z.string().min(1),
});

export const moderationReportSchema = z.object({
  reporterId: z.string().min(1),
  targetType: z.enum(["social_profile", "message", "recommendation", "opinion", "social_interaction"]),
  targetId: z.string().min(1),
  reason: z.string().min(1),
});

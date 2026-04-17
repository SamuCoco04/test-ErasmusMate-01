import { z } from "zod";

export const connectionRequestSchema = z.object({
  requesterProfileId: z.string().min(1),
  recipientProfileId: z.string().min(1),
});

export const connectionRespondSchema = z.object({
  actorProfileId: z.string().min(1),
  action: z.enum(["accepted", "rejected", "cancelled"]),
});

export const connectionBlockSchema = z.object({
  actorProfileId: z.string().min(1),
  reason: z.string().min(1),
});

export const placeContextSchema = z
  .object({
    label: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
    placeName: z.string().min(1).optional(),
    destinationCountry: z.string().min(1).optional(),
  })
  .passthrough()
  .transform(({ placeName, destinationCountry, ...rest }) => ({
    ...rest,
    label: rest.label ?? placeName,
    country: rest.country ?? destinationCountry,
  }));

export const socialContentCreateSchema = z.object({
  authorId: z.string().min(1),
  authorName: z.string().min(1).optional(),
  type: z.enum(["recommendation", "opinion"]),
  category: z.enum(["accommodation", "transport", "bureaucracy", "academics", "daily_living"]),
  title: z.string().min(3),
  body: z.string().min(3),
  placeContext: placeContextSchema.optional(),
});

export const socialContentPatchSchema = z.object({
  actorId: z.string().min(1),
  type: z.enum(["recommendation", "opinion"]).optional(),
  title: z.string().min(3).optional(),
  body: z.string().min(3).optional(),
  category: z.enum(["accommodation", "transport", "bureaucracy", "academics", "daily_living"]).optional(),
  placeContext: placeContextSchema.optional(),
});

export const socialFavoriteSchema = z.object({
  userId: z.string().min(1),
});

export const moderationReportSchema = z.object({
  reporterProfileId: z.string().min(1),
  targetType: z.enum(["social_profile", "message", "recommendation", "opinion", "social_interaction"]),
  targetId: z.string().min(1),
  reason: z.string().min(1),
});

export const socialContentListQuerySchema = z.object({
  type: z.enum(["recommendation", "opinion", "all"]).optional(),
  category: z.enum(["accommodation", "transport", "bureaucracy", "academics", "daily_living"]).optional(),
  state: z
    .enum(["draft_or_editing", "published_visible", "updated_visible", "author_deleted", "hidden_or_restricted", "removed", "all"])
    .optional(),
  authorId: z.string().min(1).optional(),
  viewerId: z.string().min(1).optional(),
});

export const socialConnectionListQuerySchema = z.object({
  profileId: z.string().min(1),
  state: z.enum(["pending", "accepted", "rejected", "cancelled", "expired", "blocked", "closed", "all"]).optional(),
});

export const moderationReportListQuerySchema = z.object({
  targetType: z.enum(["social_profile", "message", "recommendation", "opinion", "social_interaction", "all"]).optional(),
  reporterId: z.string().min(1).optional(),
});

export const socialDiscoverQuerySchema = z.object({
  actorProfileId: z.string().min(1),
});

export const socialMessagesQuerySchema = z.object({
  profileId: z.string().min(1),
});

export const socialMapQuerySchema = z.object({
  destinationCountry: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  category: z.enum(["accommodation", "transport", "bureaucracy", "academics", "daily_living", "all"]).optional(),
  type: z.enum(["recommendation", "opinion", "all"]).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  fromDate: z.string().date().optional(),
  date: z.string().date().optional(),
});

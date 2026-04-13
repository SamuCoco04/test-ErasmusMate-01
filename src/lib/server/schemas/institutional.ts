import { z } from "zod";

export const submissionDraftRequestSchema = z.object({
  actorId: z.string().min(1),
  draftPayload: z.record(z.unknown()),
});

export const submissionActionRequestSchema = z.object({
  actorId: z.string().min(1),
  rationale: z.string().trim().min(1).optional(),
  decision: z.enum(["approved", "rejected"]).optional(),
});

export const exceptionCreateRequestSchema = z.object({
  submissionId: z.string().min(1),
  requesterId: z.string().min(1),
  scope: z.enum(["deadline", "document_obligation", "procedure_condition"]),
  rationale: z.string().min(12),
  requestedEffect: z.string().min(1),
});

export const exceptionDecisionRequestSchema = z.object({
  actorId: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  rationale: z.string().min(1),
});

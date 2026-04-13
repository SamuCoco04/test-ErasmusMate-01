import { z } from "zod";

export const apiMutationResponseSchema = z.object({
  outcome: z.enum(["success", "blocked"]),
  details: z.string(),
  data: z.unknown().optional(),
});

export type ApiMutationResponse = z.infer<typeof apiMutationResponseSchema>;

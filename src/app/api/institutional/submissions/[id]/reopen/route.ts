import { z } from "zod";

import {
  blocked,
  fromUnknownError,
  invalidJsonResponse,
  invalidParamsResponse,
  parseValidationErrors,
  success,
} from "@/lib/server/http/response";
import { submissionActionRequestSchema } from "@/lib/server/schemas/institutional";
import { institutionalServerService } from "@/lib/server/services/institutional-service";

const paramsSchema = z.object({ id: z.string().min(1) });

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return invalidParamsResponse();
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return invalidJsonResponse();
  }

  const parsedBody = submissionActionRequestSchema.safeParse(json);
  if (!parsedBody.success) {
    return blocked(parseValidationErrors(parsedBody.error.issues), 400);
  }

  const { actorId, rationale } = parsedBody.data;
  if (!actorId || !rationale) {
    return blocked("Invalid request body. actorId and rationale are required.", 400);
  }

  try {
    const result = institutionalServerService.reopen(parsedParams.data.id, rationale, actorId);
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

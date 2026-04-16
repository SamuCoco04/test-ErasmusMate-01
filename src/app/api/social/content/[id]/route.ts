import { z } from "zod";

import {
  blocked,
  fromUnknownError,
  invalidJsonResponse,
  invalidParamsResponse,
  parseValidationErrors,
  success,
} from "@/lib/server/http/response";
import { socialContentPatchSchema } from "@/lib/server/schemas/social";
import { socialServerService } from "@/lib/server/services/social-service";

const paramsSchema = z.object({ id: z.string().min(1) });

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return invalidParamsResponse();
  }

  try {
    const result = await socialServerService.getContent(parsedParams.data.id);
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

  const parsedBody = socialContentPatchSchema.safeParse(json);
  if (!parsedBody.success) {
    return blocked(parseValidationErrors(parsedBody.error.issues), 400);
  }

  const { actorId, ...updates } = parsedBody.data;

  try {
    const result = await socialServerService.patchContent(parsedParams.data.id, actorId, updates);
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

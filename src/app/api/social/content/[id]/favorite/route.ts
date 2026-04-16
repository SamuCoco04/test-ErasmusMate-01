import { z } from "zod";

import {
  blocked,
  fromUnknownError,
  invalidJsonResponse,
  invalidParamsResponse,
  parseValidationErrors,
  success,
} from "@/lib/server/http/response";
import { socialFavoriteSchema } from "@/lib/server/schemas/social";
import { socialServerService } from "@/lib/server/services/social-service";

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

  const parsedBody = socialFavoriteSchema.safeParse(json);
  if (!parsedBody.success) {
    return blocked(parseValidationErrors(parsedBody.error.issues), 400);
  }

  try {
    const result = socialServerService.favorite(parsedParams.data.id, parsedBody.data.userId);
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

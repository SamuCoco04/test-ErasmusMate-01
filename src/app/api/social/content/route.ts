import {
  blocked,
  fromUnknownError,
  invalidJsonResponse,
  parseValidationErrors,
  success,
} from "@/lib/server/http/response";
import { socialContentCreateSchema } from "@/lib/server/schemas/social";
import { socialServerService } from "@/lib/server/services/social-service";

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return invalidJsonResponse();
  }

  const parsedBody = socialContentCreateSchema.safeParse(json);
  if (!parsedBody.success) {
    return blocked(parseValidationErrors(parsedBody.error.issues), 400);
  }

  try {
    const result = socialServerService.createContent(parsedBody.data);
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

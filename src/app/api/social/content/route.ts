import {
  blocked,
  fromUnknownError,
  invalidJsonResponse,
  parseQueryValidationErrors,
  parseValidationErrors,
  success,
} from "@/lib/server/http/response";
import { socialContentCreateSchema, socialContentListQuerySchema } from "@/lib/server/schemas/social";
import { socialServerService } from "@/lib/server/services/social-service";

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsedQuery = socialContentListQuerySchema.safeParse(query);

  if (!parsedQuery.success) {
    return blocked(parseQueryValidationErrors(parsedQuery.error.issues), 400);
  }

  try {
    const result = await socialServerService.listContent(parsedQuery.data);
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

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
    const result = await socialServerService.createContent(parsedBody.data);
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

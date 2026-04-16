import {
  blocked,
  fromUnknownError,
  invalidJsonResponse,
  parseQueryValidationErrors,
  parseValidationErrors,
  success,
} from "@/lib/server/http/response";
import { connectionRequestSchema, socialConnectionListQuerySchema } from "@/lib/server/schemas/social";
import { socialServerService } from "@/lib/server/services/social-service";

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsedQuery = socialConnectionListQuerySchema.safeParse(query);

  if (!parsedQuery.success) {
    return blocked(parseQueryValidationErrors(parsedQuery.error.issues), 400);
  }

  try {
    const result = await socialServerService.listConnections(parsedQuery.data);
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

  const parsedBody = connectionRequestSchema.safeParse(json);
  if (!parsedBody.success) {
    return blocked(parseValidationErrors(parsedBody.error.issues), 400);
  }

  try {
    const result = await socialServerService.createConnection(
      parsedBody.data.requesterProfileId,
      parsedBody.data.recipientProfileId,
    );
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

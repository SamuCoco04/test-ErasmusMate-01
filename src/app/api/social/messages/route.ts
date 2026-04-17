import { blocked, fromUnknownError, parseQueryValidationErrors, success } from "@/lib/server/http/response";
import { socialMessagesQuerySchema } from "@/lib/server/schemas/social";
import { socialServerService } from "@/lib/server/services/social-service";

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsedQuery = socialMessagesQuerySchema.safeParse(query);

  if (!parsedQuery.success) {
    return blocked(parseQueryValidationErrors(parsedQuery.error.issues), 400);
  }

  try {
    const result = await socialServerService.listMessageThreads(parsedQuery.data);
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

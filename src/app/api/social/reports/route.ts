import {
  blocked,
  fromUnknownError,
  invalidJsonResponse,
  parseValidationErrors,
  success,
} from "@/lib/server/http/response";
import { moderationReportListQuerySchema, moderationReportSchema } from "@/lib/server/schemas/social";
import { socialServerService } from "@/lib/server/services/social-service";

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsedQuery = moderationReportListQuerySchema.safeParse(query);

  if (!parsedQuery.success) {
    return blocked(parseValidationErrors(parsedQuery.error.issues), 400);
  }

  try {
    const result = await socialServerService.listReports(parsedQuery.data);
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

  const parsedBody = moderationReportSchema.safeParse(json);
  if (!parsedBody.success) {
    return blocked(parseValidationErrors(parsedBody.error.issues), 400);
  }

  try {
    const body = parsedBody.data;
    const result = await socialServerService.report(body.reporterId, body.targetType, body.targetId, body.reason);
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

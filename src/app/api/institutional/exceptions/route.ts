import {
  blocked,
  fromUnknownError,
  invalidJsonResponse,
  parseValidationErrors,
  success,
} from "@/lib/server/http/response";
import { exceptionCreateRequestSchema, exceptionListQuerySchema } from "@/lib/server/schemas/institutional";
import { institutionalServerService } from "@/lib/server/services/institutional-service";

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsedQuery = exceptionListQuerySchema.safeParse(query);

  if (!parsedQuery.success) {
    return blocked(parseValidationErrors(parsedQuery.error.issues), 400);
  }

  try {
    const result = await institutionalServerService.listExceptions(parsedQuery.data);
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

  const parsedBody = exceptionCreateRequestSchema.safeParse(json);
  if (!parsedBody.success) {
    return blocked(parseValidationErrors(parsedBody.error.issues), 400);
  }

  try {
    const result = await institutionalServerService.createException(parsedBody.data);
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

import {
  blocked,
  fromUnknownError,
  invalidJsonResponse,
  parseValidationErrors,
  success,
} from "@/lib/server/http/response";
import { exceptionCreateRequestSchema } from "@/lib/server/schemas/institutional";
import { institutionalServerService } from "@/lib/server/services/institutional-service";

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
    const result = institutionalServerService.createException(parsedBody.data);
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

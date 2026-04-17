import { blocked, fromUnknownError, parseQueryValidationErrors, success } from "@/lib/server/http/response";
import { z } from "zod";

import { institutionalServerService } from "@/lib/server/services/institutional-service";

const querySchema = z.object({
  role: z.enum(["student", "coordinator"]).optional(),
});

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsedQuery = querySchema.safeParse(query);

  if (!parsedQuery.success) {
    return blocked(parseQueryValidationErrors(parsedQuery.error.issues), 400);
  }

  try {
    const result = await institutionalServerService.listSubmissions(parsedQuery.data);
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

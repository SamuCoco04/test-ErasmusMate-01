import { fromUnknownError, success } from "@/lib/server/http/response";
import { institutionalServerService } from "@/lib/server/services/institutional-service";

export async function GET() {
  try {
    const result = await institutionalServerService.listDeadlines();
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

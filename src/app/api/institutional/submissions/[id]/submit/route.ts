import { z } from "zod";

import { fromUnknownError, invalidParamsResponse, success } from "@/lib/server/http/response";
import { institutionalServerService } from "@/lib/server/services/institutional-service";

const paramsSchema = z.object({ id: z.string().min(1) });

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return invalidParamsResponse();
  }

  try {
    const result = await institutionalServerService.submit(parsedParams.data.id);
    return success(result.details, result.data);
  } catch (error) {
    return fromUnknownError(error);
  }
}

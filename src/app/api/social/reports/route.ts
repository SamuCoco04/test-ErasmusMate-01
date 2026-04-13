import { NextResponse } from "next/server";

import { serverMockDb } from "@/lib/server/mock-db";
import { moderationReportSchema } from "@/lib/server/schemas/social";

export async function POST(request: Request) {
  const body = moderationReportSchema.parse(await request.json());
  const result = serverMockDb.report(body.reporterId, body.targetType, body.targetId, body.reason);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

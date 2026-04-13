import { NextResponse } from "next/server";

import { serverMockDb } from "@/lib/server/mock-db";
import { moderationReportSchema } from "@/lib/server/schemas/social";

export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      { outcome: "blocked", details: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const parsedBody = moderationReportSchema.safeParse(requestBody);
  if (!parsedBody.success) {
    return NextResponse.json(
      { outcome: "blocked", details: parsedBody.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsedBody.data;
  const result = serverMockDb.report(body.reporterId, body.targetType, body.targetId, body.reason);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

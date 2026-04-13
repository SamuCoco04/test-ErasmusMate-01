import { NextResponse } from "next/server";

import { serverMockDb } from "@/lib/server/mock-db";
import { connectionRequestSchema } from "@/lib/server/schemas/social";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { outcome: "blocked", details: ["Invalid JSON request body"] },
      { status: 400 },
    );
  }

  const bodyResult = connectionRequestSchema.safeParse(payload);
  if (!bodyResult.success) {
    return NextResponse.json(
      {
        outcome: "blocked",
        details: bodyResult.error.issues.map((issue) => issue.message),
      },
      { status: 400 },
    );
  }

  const body = bodyResult.data;
  const result = serverMockDb.createConnection(body.requesterProfileId, body.recipientProfileId);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

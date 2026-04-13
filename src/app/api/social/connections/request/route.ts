import { NextResponse } from "next/server";

import { serverMockDb } from "@/lib/server/mock-db";
import { connectionRequestSchema } from "@/lib/server/schemas/social";

export async function POST(request: Request) {
  const body = connectionRequestSchema.parse(await request.json());
  const result = serverMockDb.createConnection(body.requesterProfileId, body.recipientProfileId);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

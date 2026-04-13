import { NextResponse } from "next/server";

import { serverMockDb } from "@/lib/server/mock-db";
import { connectionRespondSchema } from "@/lib/server/schemas/social";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = connectionRespondSchema.parse(await request.json());
  const { id } = await params;
  const result = serverMockDb.respondConnection(id, body.action);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

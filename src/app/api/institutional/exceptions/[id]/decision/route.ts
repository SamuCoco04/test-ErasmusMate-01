import { NextResponse } from "next/server";

import { exceptionDecisionRequestSchema } from "@/lib/server/schemas/institutional";
import { serverMockDb } from "@/lib/server/mock-db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = exceptionDecisionRequestSchema.parse(await request.json());
  const { id } = await params;
  const result = serverMockDb.decideException(id, body.decision, body.rationale);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

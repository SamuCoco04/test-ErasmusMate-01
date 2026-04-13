import { NextResponse } from "next/server";

import { exceptionDecisionRequestSchema } from "@/lib/server/schemas/institutional";
import { serverMockDb } from "@/lib/server/mock-db";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = exceptionDecisionRequestSchema.safeParse(json);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const body = parsedBody.data;
  const { id } = params;
  const result = serverMockDb.decideException(id, body.decision, body.rationale);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

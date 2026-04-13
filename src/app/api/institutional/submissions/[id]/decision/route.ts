import { NextResponse } from "next/server";

import { submissionActionRequestSchema } from "@/lib/server/schemas/institutional";
import { serverMockDb } from "@/lib/server/mock-db";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ outcome: "blocked", details: "Invalid JSON request body." }, { status: 400 });
  }

  const parsedBody = submissionActionRequestSchema.safeParse(json);
  if (!parsedBody.success) {
    return NextResponse.json({ outcome: "blocked", details: "Invalid request body." }, { status: 400 });
  }

  const body = parsedBody.data;
  const { id } = params;
  if (!body.decision || !body.rationale) {
    return NextResponse.json({ outcome: "blocked", details: "decision and rationale are required." }, { status: 400 });
  }

  const result = serverMockDb.decision(id, body.decision, body.rationale);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

import { NextResponse } from "next/server";

import { submissionActionRequestSchema } from "@/lib/server/schemas/institutional";
import { serverMockDb } from "@/lib/server/mock-db";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ outcome: "blocked", details: "Invalid JSON body." }, { status: 400 });
  }

  const parsedBody = submissionActionRequestSchema.safeParse(json);
  if (!parsedBody.success) {
    return NextResponse.json({ outcome: "blocked", details: "Invalid request body." }, { status: 400 });
  }

  const body = parsedBody.data;
  const { id } = params;
  if (!body.rationale) {
    return NextResponse.json({ outcome: "blocked", details: "rationale is required." }, { status: 400 });
  }
  const result = serverMockDb.reopen(id, body.rationale);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

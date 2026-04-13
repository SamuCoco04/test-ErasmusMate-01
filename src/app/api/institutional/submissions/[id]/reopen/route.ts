import { NextResponse } from "next/server";

import { submissionActionRequestSchema } from "@/lib/server/schemas/institutional";
import { serverMockDb } from "@/lib/server/mock-db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = submissionActionRequestSchema.parse(await request.json());
  const { id } = await params;
  if (!body.rationale) {
    return NextResponse.json({ outcome: "blocked", details: "rationale is required." }, { status: 400 });
  }
  const result = serverMockDb.reopen(id, body.rationale);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

import { NextResponse } from "next/server";

import { submissionDraftRequestSchema } from "@/lib/server/schemas/institutional";
import { serverMockDb } from "@/lib/server/mock-db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = submissionDraftRequestSchema.parse(await request.json());
  const { id } = await params;
  const result = serverMockDb.saveDraft(id, body.draftPayload);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

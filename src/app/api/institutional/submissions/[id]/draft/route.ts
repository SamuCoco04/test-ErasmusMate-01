import { NextResponse } from "next/server";

import { submissionDraftRequestSchema } from "@/lib/server/schemas/institutional";
import { serverMockDb } from "@/lib/server/mock-db";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const parsedBody = submissionDraftRequestSchema.safeParse(json);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const body = parsedBody.data;
  const { id } = params;
  const result = serverMockDb.saveDraft(id, body.draftPayload);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

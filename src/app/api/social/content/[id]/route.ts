import { NextResponse } from "next/server";

import { serverMockDb } from "@/lib/server/mock-db";
import { socialContentPatchSchema } from "@/lib/server/schemas/social";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = socialContentPatchSchema.parse(await request.json());
  const { id } = await params;
  const { actorId, ...updates } = body;
  const result = serverMockDb.patchContent(id, actorId, updates);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

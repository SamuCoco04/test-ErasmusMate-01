import { NextResponse } from "next/server";

import { serverMockDb } from "@/lib/server/mock-db";
import { socialContentPatchSchema } from "@/lib/server/schemas/social";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = socialContentPatchSchema.safeParse(json);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsedBody.error.issues },
      { status: 400 },
    );
  }

  const { id } = params;
  const { actorId, ...updates } = parsedBody.data;
  const result = serverMockDb.patchContent(id, actorId, updates);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

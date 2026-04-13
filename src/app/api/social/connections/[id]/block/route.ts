import { NextResponse } from "next/server";

import { serverMockDb } from "@/lib/server/mock-db";
import { connectionBlockSchema } from "@/lib/server/schemas/social";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const parsedBody = connectionBlockSchema.safeParse(json);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { id } = params;
  const result = serverMockDb.blockConnection(id, parsedBody.data.reason);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

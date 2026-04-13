import { NextResponse } from "next/server";

import { serverMockDb } from "@/lib/server/mock-db";
import { connectionRespondSchema } from "@/lib/server/schemas/social";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const body = connectionRespondSchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { id } = params;
  const result = serverMockDb.respondConnection(id, body.data.action);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

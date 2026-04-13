import { NextResponse } from "next/server";

import { exceptionCreateRequestSchema } from "@/lib/server/schemas/institutional";
import { serverMockDb } from "@/lib/server/mock-db";

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { outcome: "blocked", details: "Invalid JSON request body" },
      { status: 400 },
    );
  }

  const parsedBody = exceptionCreateRequestSchema.safeParse(json);
  if (!parsedBody.success) {
    return NextResponse.json(
      { outcome: "blocked", details: "Invalid request body" },
      { status: 400 },
    );
  }

  const result = serverMockDb.createException(parsedBody.data);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

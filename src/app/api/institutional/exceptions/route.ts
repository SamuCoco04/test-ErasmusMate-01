import { NextResponse } from "next/server";

import { exceptionCreateRequestSchema } from "@/lib/server/schemas/institutional";
import { serverMockDb } from "@/lib/server/mock-db";

export async function POST(request: Request) {
  const body = exceptionCreateRequestSchema.parse(await request.json());
  const result = serverMockDb.createException(body);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

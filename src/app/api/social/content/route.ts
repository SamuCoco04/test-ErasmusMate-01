import { NextResponse } from "next/server";

import { serverMockDb } from "@/lib/server/mock-db";
import { socialContentCreateSchema } from "@/lib/server/schemas/social";

export async function POST(request: Request) {
  const body = socialContentCreateSchema.parse(await request.json());
  const result = serverMockDb.createContent(body);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

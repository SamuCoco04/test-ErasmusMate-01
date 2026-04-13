import { NextResponse } from "next/server";

import { serverMockDb } from "@/lib/server/mock-db";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = serverMockDb.submit(id);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

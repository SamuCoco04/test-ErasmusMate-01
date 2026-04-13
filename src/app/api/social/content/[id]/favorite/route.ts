import { NextResponse } from "next/server";

import { serverMockDb } from "@/lib/server/mock-db";
import { socialFavoriteSchema } from "@/lib/server/schemas/social";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = socialFavoriteSchema.parse(await request.json());
  const { id } = await params;
  const result = serverMockDb.favorite(id, body.userId);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

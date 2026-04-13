import { NextResponse } from "next/server";

import { serverMockDb } from "@/lib/server/mock-db";
import { socialContentCreateSchema } from "@/lib/server/schemas/social";

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      {
        outcome: "blocked",
        details: ["Request body must be valid JSON."],
      },
      { status: 400 },
    );
  }

  const parsedBody = socialContentCreateSchema.safeParse(json);
  if (!parsedBody.success) {
    return NextResponse.json(
      {
        outcome: "blocked",
        details: parsedBody.error.issues.map((issue) =>
          issue.path.length > 0 ? `${issue.path.join(".")}: ${issue.message}` : issue.message,
        ),
      },
      { status: 400 },
    );
  }

  const result = serverMockDb.createContent(parsedBody.data);
  return NextResponse.json(result, { status: result.outcome === "success" ? 200 : 400 });
}

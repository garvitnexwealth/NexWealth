import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";

const platformSchema = z.object({
  name: z.string().min(2),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const platforms = await prisma.platform.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: platforms });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = platformSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const platform = await prisma.platform.create({
    data: { name: parsed.data.name },
  });

  return NextResponse.json({ data: platform });
}

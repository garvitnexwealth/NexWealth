import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";
import { invalidateDashboardCache } from "@/lib/cache";

const snapshotSchema = z.object({
  liabilityId: z.number().int().positive(),
  asOfDate: z.coerce.date(),
  outstanding: z.number(),
});

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const liabilityId = searchParams.get("liabilityId");

  const snapshots = await prisma.liabilitySnapshot.findMany({
    where: {
      userId,
      ...(liabilityId ? { liabilityId: Number(liabilityId) } : {}),
    },
    orderBy: { asOfDate: "desc" },
  });

  return NextResponse.json({ data: snapshots });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = snapshotSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const liability = await prisma.liability.findFirst({
    where: { id: parsed.data.liabilityId, userId },
  });
  if (!liability) {
    return NextResponse.json({ error: "Liability not found" }, { status: 404 });
  }

  const snapshot = await prisma.liabilitySnapshot.create({
    data: {
      userId,
      liabilityId: parsed.data.liabilityId,
      asOfDate: parsed.data.asOfDate,
      outstanding: parsed.data.outstanding,
    },
  });

  await invalidateDashboardCache(userId);

  return NextResponse.json({ data: snapshot });
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";

const allocationSchema = z.object({
  assetCategory: z.number().int(),
  targetPercent: z.number(),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const allocations = await prisma.targetAllocation.findMany({
    where: { userId },
    orderBy: { assetCategory: "asc" },
  });

  return NextResponse.json({ data: allocations });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = allocationSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const allocation = await prisma.targetAllocation.upsert({
    where: {
      userId_assetCategory: {
        userId,
        assetCategory: parsed.data.assetCategory,
      },
    },
    update: {
      targetPercent: parsed.data.targetPercent,
    },
    create: {
      userId,
      assetCategory: parsed.data.assetCategory,
      targetPercent: parsed.data.targetPercent,
    },
  });

  return NextResponse.json({ data: allocation });
}

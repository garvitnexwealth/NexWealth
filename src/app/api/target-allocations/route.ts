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

  const allocations = await prisma.target_allocations.findMany({
    where: { user_id: userId },
    orderBy: { asset_category: "asc" },
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

  const allocation = await prisma.target_allocations.upsert({
    where: {
      user_id_asset_category: {
        user_id: userId,
        asset_category: parsed.data.assetCategory,
      },
    },
    update: {
      target_percent: parsed.data.targetPercent,
    },
    create: {
      user_id: userId,
      asset_category: parsed.data.assetCategory,
      target_percent: parsed.data.targetPercent,
    },
  });

  return NextResponse.json({ data: allocation });
}

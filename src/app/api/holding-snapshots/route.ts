import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";
import { currencySchema } from "@/lib/validation";
import { invalidateDashboardCache } from "@/lib/cache";

const snapshotSchema = z.object({
  platformAccountId: z.number().int().positive().nullable().optional(),
  label: z.string().min(1),
  assetCategory: z.number().int(),
  value: z.number(),
  currency: currencySchema,
  asOfDate: z.coerce.date(),
});

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const platformAccountId = searchParams.get("platformAccountId");
  const assetCategory = searchParams.get("assetCategory");

  const snapshots = await prisma.holding_snapshots.findMany({
    where: {
      user_id: userId,
      ...(platformAccountId ? { platform_account_id: Number(platformAccountId) } : {}),
      ...(assetCategory ? { asset_category: Number(assetCategory) } : {}),
    },
    orderBy: { as_of_date: "desc" },
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

  if (parsed.data.platformAccountId) {
    const account = await prisma.userPlatformAccount.findFirst({
      where: { id: parsed.data.platformAccountId, userId },
    });
    if (!account) {
      return NextResponse.json({ error: "Platform account not found" }, { status: 404 });
    }
  }

  const snapshot = await prisma.holding_snapshots.create({
    data: {
      user_id: userId,
      platform_account_id: parsed.data.platformAccountId ?? null,
      label: parsed.data.label,
      asset_category: parsed.data.assetCategory,
      value: parsed.data.value,
      currency: parsed.data.currency,
      as_of_date: parsed.data.asOfDate,
    },
  });

  await invalidateDashboardCache(userId);

  return NextResponse.json({ data: snapshot });
}

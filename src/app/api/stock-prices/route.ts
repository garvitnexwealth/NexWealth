import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";
import { currencySchema } from "@/lib/validation";
import { invalidateDashboardCache } from "@/lib/cache";

const priceSchema = z.object({
  stockId: z.number().int().positive(),
  price: z.number(),
  currency: currencySchema,
  asOfDate: z.coerce.date(),
  source: z.string().optional(),
});

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const stockId = searchParams.get("stockId");

  const prices = await prisma.stockPrice.findMany({
    where: {
      userId,
      ...(stockId ? { stockId: Number(stockId) } : {}),
    },
    orderBy: { asOfDate: "desc" },
  });

  return NextResponse.json({ data: prices });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = priceSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const stock = await prisma.stockList.findUnique({
    where: { id: parsed.data.stockId },
  });
  if (!stock) {
    return NextResponse.json({ error: "Stock not found" }, { status: 404 });
  }

  const price = await prisma.stockPrice.create({
    data: {
      userId,
      stockId: parsed.data.stockId,
      price: parsed.data.price,
      currency: parsed.data.currency,
      asOfDate: parsed.data.asOfDate,
      source: parsed.data.source ?? "manual",
    },
  });

  await invalidateDashboardCache(userId);

  return NextResponse.json({ data: price });
}

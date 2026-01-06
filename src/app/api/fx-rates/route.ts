import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";
import { currencySchema } from "@/lib/validation";
import { invalidateDashboardCache } from "@/lib/cache";

const fxSchema = z.object({
  asOfDate: z.coerce.date(),
  fromCurrency: currencySchema,
  toCurrency: currencySchema,
  rate: z.number(),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const rates = await prisma.fxRate.findMany({
    where: { userId },
    orderBy: { asOfDate: "desc" },
  });

  return NextResponse.json({ data: rates });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = fxSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const rate = await prisma.fxRate.create({
    data: {
      userId,
      asOfDate: parsed.data.asOfDate,
      fromCurrency: parsed.data.fromCurrency,
      toCurrency: parsed.data.toCurrency,
      rate: parsed.data.rate,
    },
  });

  await invalidateDashboardCache(userId);

  return NextResponse.json({ data: rate });
}

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

  const rates = await prisma.fx_rates.findMany({
    where: { user_id: userId },
    orderBy: { as_of_date: "desc" },
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

  const rate = await prisma.fx_rates.create({
    data: {
      user_id: userId,
      as_of_date: parsed.data.asOfDate,
      from_currency: parsed.data.fromCurrency,
      to_currency: parsed.data.toCurrency,
      rate: parsed.data.rate,
    },
  });

  await invalidateDashboardCache(userId);

  return NextResponse.json({ data: rate });
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";
import { currencySchema } from "@/lib/validation";
import { invalidateDashboardCache } from "@/lib/cache";

const valuationSchema = z.object({
  propertyName: z.string().min(2),
  asOfDate: z.coerce.date(),
  value: z.number(),
  currency: currencySchema,
  notes: z.string().optional(),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const valuations = await prisma.real_estate_valuations.findMany({
    where: { user_id: userId },
    orderBy: { as_of_date: "desc" },
  });

  return NextResponse.json({ data: valuations });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = valuationSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const valuation = await prisma.real_estate_valuations.create({
    data: {
      user_id: userId,
      property_name: parsed.data.propertyName,
      as_of_date: parsed.data.asOfDate,
      value: parsed.data.value,
      currency: parsed.data.currency,
      notes: parsed.data.notes,
    },
  });

  await invalidateDashboardCache(userId);

  return NextResponse.json({ data: valuation });
}

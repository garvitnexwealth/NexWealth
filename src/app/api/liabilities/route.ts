import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";
import { invalidateDashboardCache } from "@/lib/cache";

const liabilitySchema = z.object({
  name: z.string().min(2),
  liabilityType: z.number().int(),
  lender: z.string().optional(),
  principal: z.number().optional().nullable(),
  interestRate: z.number().optional().nullable(),
  tenureMonths: z.number().int().optional().nullable(),
  emi: z.number().optional().nullable(),
  status: z.number().int().optional(),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const liabilities = await prisma.liability.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: liabilities });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = liabilitySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const liability = await prisma.liability.create({
    data: {
      userId,
      name: parsed.data.name,
      liabilityType: parsed.data.liabilityType,
      lender: parsed.data.lender,
      principal: parsed.data.principal ?? 0,
      interestRate: parsed.data.interestRate ?? null,
      tenureMonths: parsed.data.tenureMonths ?? null,
      emi: parsed.data.emi ?? null,
      status: parsed.data.status ?? 1,
    },
  });

  await invalidateDashboardCache(userId);

  return NextResponse.json({ data: liability });
}

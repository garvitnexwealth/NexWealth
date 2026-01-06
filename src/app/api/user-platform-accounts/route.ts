import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";
import { currencySchema } from "@/lib/validation";

const accountSchema = z.object({
  platformId: z.number().int().positive(),
  subAccountTypeId: z.number().int().positive(),
  currency: currencySchema,
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const accounts = await prisma.userPlatformAccount.findMany({
    where: { userId },
    include: {
      platform: true,
      subAccountType: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: accounts });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const [platform, subAccountType] = await Promise.all([
    prisma.platform.findUnique({ where: { id: parsed.data.platformId } }),
    prisma.subAccountType.findUnique({ where: { id: parsed.data.subAccountTypeId } }),
  ]);

  if (!platform || !subAccountType) {
    return NextResponse.json({ error: "Platform or sub account type not found" }, { status: 404 });
  }

  const account = await prisma.userPlatformAccount.create({
    data: {
      userId,
      platformId: parsed.data.platformId,
      subAccountTypeId: parsed.data.subAccountTypeId,
      currency: parsed.data.currency,
    },
  });

  return NextResponse.json({ data: account });
}

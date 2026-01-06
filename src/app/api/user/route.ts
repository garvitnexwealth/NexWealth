import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";
import { currencySchema } from "@/lib/validation";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  displayCurrency: currencySchema.optional(),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      display_currency: true,
    },
  });

  return NextResponse.json({
    data: user
      ? {
          id: user.id,
          email: user.email,
          name: user.name,
          displayCurrency: user.display_currency,
        }
      : null,
  });
}

export async function PATCH(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      display_currency: parsed.data.displayCurrency,
    },
    select: { id: true, email: true, name: true, display_currency: true },
  });

  return NextResponse.json({
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      displayCurrency: user.display_currency,
    },
  });
}

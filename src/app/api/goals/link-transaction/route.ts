import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";

const linkSchema = z.object({
  goalId: z.number().int().positive(),
  transactionId: z.number().int().positive(),
});

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const [goal, transaction] = await Promise.all([
    prisma.goals.findFirst({ where: { id: parsed.data.goalId, user_id: userId } }),
    prisma.transaction.findFirst({ where: { id: parsed.data.transactionId, userId } }),
  ]);

  if (!goal || !transaction) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const link = await prisma.goal_transaction_links.create({
    data: {
      user_id: userId,
      goal_id: parsed.data.goalId,
      transaction_id: parsed.data.transactionId,
    },
  });

  return NextResponse.json({ data: link });
}

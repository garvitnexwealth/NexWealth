import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";

const goalSchema = z.object({
  name: z.string().min(2),
  targetAmount: z.number(),
  targetDate: z.coerce.date(),
  priority: z.number().int().optional().default(3),
  assetCategory: z.number().int(),
  status: z.number().int().optional().default(1),
  notes: z.string().optional(),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ data: goals });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = goalSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const goal = await prisma.goal.create({
    data: {
      userId,
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      targetDate: parsed.data.targetDate,
      priority: parsed.data.priority,
      assetCategory: parsed.data.assetCategory,
      status: parsed.data.status,
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json({ data: goal });
}

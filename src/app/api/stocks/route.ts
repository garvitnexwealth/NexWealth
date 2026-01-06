import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";

const stockSchema = z.object({
  name: z.string().min(2),
  type: z.number().int().positive(),
  symbol: z.string().optional(),
  symbol2: z.string().optional(),
  sector: z.string().optional(),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const stocks = await prisma.stockList.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: stocks });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = stockSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const stock = await prisma.stockList.create({
    data: parsed.data,
  });

  return NextResponse.json({ data: stock });
}

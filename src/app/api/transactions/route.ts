import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { badRequest, unauthorized } from "@/lib/api";
import { currencySchema, paginationSchema } from "@/lib/validation";
import { TxnAction } from "@/lib/enums";
import { invalidateDashboardCache } from "@/lib/cache";

const transactionSchema = z
  .object({
    platformAccountId: z.number().int().positive(),
    stockId: z.number().int().positive().nullable().optional(),
    relatedLiabilityId: z.number().int().positive().nullable().optional(),
    txnAction: z.number().int(),
    txnDate: z.coerce.date(),
    quantity: z.number().optional().nullable(),
    unitPrice: z.number().optional().nullable(),
    amount: z.number(),
    currency: currencySchema,
    fees: z.number().optional().default(0),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if ([TxnAction.BUY, TxnAction.SELL].includes(data.txnAction)) {
      if (!data.stockId || !data.quantity || !data.unitPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BUY/SELL require stockId, quantity, and unitPrice",
        });
      }
    }
  });

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const pagination = paginationSchema.parse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  const where = {
    userId,
    ...(searchParams.get("txnAction")
      ? { txnAction: Number(searchParams.get("txnAction")) }
      : {}),
    ...(searchParams.get("platformAccountId")
      ? { platformAccountId: Number(searchParams.get("platformAccountId")) }
      : {}),
    ...(searchParams.get("stockId") ? { stockId: Number(searchParams.get("stockId")) } : {}),
    ...(searchParams.get("relatedLiabilityId")
      ? { relatedLiabilityId: Number(searchParams.get("relatedLiabilityId")) }
      : {}),
    ...(searchParams.get("from") || searchParams.get("to")
      ? {
          txnDate: {
            ...(searchParams.get("from") ? { gte: new Date(String(searchParams.get("from"))) } : {}),
            ...(searchParams.get("to") ? { lte: new Date(String(searchParams.get("to"))) } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        platformAccount: { include: { platform: true, subAccountType: true } },
        stock: true,
        relatedLiability: true,
      },
      orderBy: { txnDate: "desc" },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({ data: items, total, page: pagination.page });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = transactionSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const account = await prisma.userPlatformAccount.findFirst({
    where: { id: parsed.data.platformAccountId, userId },
  });
  if (!account) {
    return NextResponse.json({ error: "Platform account not found" }, { status: 404 });
  }

  if (parsed.data.relatedLiabilityId) {
    const liability = await prisma.liability.findFirst({
      where: { id: parsed.data.relatedLiabilityId, userId },
    });
    if (!liability) {
      return NextResponse.json({ error: "Liability not found" }, { status: 404 });
    }
  }

  if (parsed.data.stockId) {
    const stock = await prisma.stockList.findUnique({ where: { id: parsed.data.stockId } });
    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      platformAccountId: parsed.data.platformAccountId,
      stockId: parsed.data.stockId ?? null,
      relatedLiabilityId: parsed.data.relatedLiabilityId ?? null,
      txnAction: parsed.data.txnAction,
      txnDate: parsed.data.txnDate,
      quantity: parsed.data.quantity ?? null,
      unitPrice: parsed.data.unitPrice ?? null,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      fees: parsed.data.fees ?? 0,
      notes: parsed.data.notes,
      tags: parsed.data.tags ?? [],
    },
  });

  await invalidateDashboardCache(userId);

  return NextResponse.json({ data: transaction });
}

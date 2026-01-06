import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { unauthorized } from "@/lib/api";
import { getRedis } from "@/lib/redis";
import { AssetCategory, TxnAction } from "@/lib/enums";

const rangeOptions = ["1M", "3M", "1Y", "ALL"] as const;

type Range = (typeof rangeOptions)[number];

type Currency = "INR" | "USD";

type FxCacheKey = `${Currency}-${Currency}-${string}`;

function getRange(value: string | null): Range {
  if (value && rangeOptions.includes(value as Range)) {
    return value as Range;
  }
  return "3M";
}

function getCurrency(value: string | null): Currency | null {
  if (value === "INR" || value === "USD") {
    return value;
  }
  return null;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildBucketDates(range: Range, endDate: Date) {
  const dates: Date[] = [];
  const end = new Date(endDate);

  if (range === "1M") {
    for (let i = 4; i >= 0; i -= 1) {
      const d = new Date(end);
      d.setDate(end.getDate() - i * 7);
      dates.push(d);
    }
  } else if (range === "3M") {
    for (let i = 2; i >= 0; i -= 1) {
      const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
      dates.push(d);
    }
  } else if (range === "1Y") {
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
      dates.push(d);
    }
  } else {
    for (let i = 4; i >= 0; i -= 1) {
      const d = new Date(end.getFullYear() - i, 0, 1);
      dates.push(d);
    }
  }

  return dates;
}

async function getFxRate(
  userId: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  asOfDate: Date,
  cache: Map<FxCacheKey, number>
) {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  const key: FxCacheKey = `${fromCurrency}-${toCurrency}-${asOfDate.toISOString().slice(0, 10)}`;
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const rate = await prisma.fxRate.findFirst({
    where: {
      userId,
      fromCurrency,
      toCurrency,
      asOfDate: { lte: asOfDate },
    },
    orderBy: { asOfDate: "desc" },
  });

  if (!rate) {
    return null;
  }

  cache.set(key, Number(rate.rate));
  return Number(rate.rate);
}

function mergeLatest<T>(items: T[], keyFn: (item: T) => string) {
  const map = new Map<string, T>();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const range = getRange(searchParams.get("range"));
  const queryCurrency = getCurrency(searchParams.get("currency"));

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const displayCurrency = queryCurrency ?? (user?.displayCurrency as Currency) ?? "INR";

  const cache = getRedis();
  const cacheKey = `dashboard:${userId}:${displayCurrency}:${range}`;
  if (cache) {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
  }

  const warnings: string[] = [];
  const fxCache = new Map<FxCacheKey, number>();
  const now = new Date();

  const [
    transactions,
    stockPrices,
    holdingSnapshotsRaw,
    liabilitySnapshotsRaw,
    liabilities,
    realEstateRaw,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        txnAction: { in: [TxnAction.BUY, TxnAction.SELL] },
      },
      include: { stock: true },
      orderBy: { txnDate: "asc" },
    }),
    prisma.stockPrice.findMany({
      where: { userId, asOfDate: { lte: now } },
      orderBy: { asOfDate: "desc" },
    }),
    prisma.holdingSnapshot.findMany({
      where: { userId, asOfDate: { lte: now } },
      orderBy: { asOfDate: "desc" },
    }),
    prisma.liabilitySnapshot.findMany({
      where: { userId, asOfDate: { lte: now } },
      orderBy: { asOfDate: "desc" },
    }),
    prisma.liability.findMany({
      where: { userId },
    }),
    prisma.realEstateValuation.findMany({
      where: { userId, asOfDate: { lte: now } },
      orderBy: { asOfDate: "desc" },
    }),
  ]);

  const latestStockPrices = mergeLatest(stockPrices, (item) => String(item.stockId));
  const latestHoldingSnapshots = mergeLatest(
    holdingSnapshotsRaw,
    (item) => `${item.label}-${item.assetCategory}-${item.platformAccountId ?? 0}`
  );
  const latestLiabilitySnapshots = mergeLatest(
    liabilitySnapshotsRaw,
    (item) => String(item.liabilityId)
  );
  const latestRealEstate = mergeLatest(realEstateRaw, (item) => item.propertyName);

  const stockPriceById = new Map<number, { price: number; currency: Currency; asOfDate: Date }>();
  for (const price of latestStockPrices) {
    stockPriceById.set(price.stockId, {
      price: Number(price.price),
      currency: price.currency as Currency,
      asOfDate: price.asOfDate,
    });
  }

  const positions = new Map<number, { quantity: number; costBasis: number; invested: number; stockName: string; stockType: number }>();

  for (const txn of transactions) {
    if (!txn.stockId || !txn.stock) {
      continue;
    }
    if (![TxnAction.BUY, TxnAction.SELL].includes(txn.txnAction)) {
      continue;
    }
    const key = txn.stockId;
    const existing = positions.get(key) ?? {
      quantity: 0,
      costBasis: 0,
      invested: 0,
      stockName: txn.stock.name,
      stockType: txn.stock.type,
    };

    const qty = Number(txn.quantity ?? 0);
    const unitPrice = Number(txn.unitPrice ?? 0);
    const fees = Number(txn.fees ?? 0);

    if (txn.txnAction === TxnAction.BUY) {
      existing.quantity += qty;
      existing.costBasis += qty * unitPrice + fees;
      existing.invested += qty * unitPrice + fees;
    } else if (txn.txnAction === TxnAction.SELL && existing.quantity > 0) {
      const avgCost = existing.costBasis / existing.quantity;
      existing.quantity -= qty;
      existing.costBasis -= avgCost * qty;
    }

    positions.set(key, existing);
  }

  const snapshotItems: Array<{
    label: string;
    value: number;
    invested: number | null;
    gainAbs: number | null;
    gainPct: number | null;
    category: AssetCategory;
  }> = [];

  for (const snap of latestHoldingSnapshots) {
    if (snap.assetCategory === AssetCategory.REAL_ESTATE) {
      warnings.push("Real estate snapshots detected; valuations take precedence.");
      continue;
    }
    const fxRate = await getFxRate(
      userId,
      snap.currency as Currency,
      displayCurrency,
      snap.asOfDate,
      fxCache
    );

    let convertedValue = Number(snap.value);
    if (fxRate) {
      convertedValue *= fxRate;
    } else if (snap.currency !== displayCurrency) {
      warnings.push("Missing FX rate for some snapshots. Using native currency values.");
    }

    snapshotItems.push({
      label: snap.label,
      value: round(convertedValue),
      invested: null,
      gainAbs: null,
      gainPct: null,
      category: snap.assetCategory as AssetCategory,
    });
  }

  const snapshotFallback = new Map<string, (typeof snapshotItems)[number]>();
  for (const item of snapshotItems) {
    if ([AssetCategory.US_STOCKS, AssetCategory.IND_STOCKS].includes(item.category)) {
      snapshotFallback.set(item.label, item);
    }
  }

  const usedFallback = new Set<string>();
  let stocksTotal = 0;
  const stockItems: Array<{
    label: string;
    value: number;
    invested: number | null;
    gainAbs: number | null;
    gainPct: number | null;
    category: AssetCategory;
  }> = [];

  for (const [stockId, position] of positions.entries()) {
    if (position.quantity <= 0) {
      continue;
    }
    const price = stockPriceById.get(stockId);

    if (!price) {
      const fallback = snapshotFallback.get(position.stockName);
      if (fallback) {
        usedFallback.add(fallback.label);
        stocksTotal += fallback.value;
        stockItems.push({
          label: position.stockName,
          value: round(fallback.value),
          invested: null,
          gainAbs: null,
          gainPct: null,
          category: position.stockType === 1 ? AssetCategory.US_STOCKS : AssetCategory.IND_STOCKS,
        });
      }
      continue;
    }

    const fxRate = await getFxRate(
      userId,
      price.currency,
      displayCurrency,
      price.asOfDate,
      fxCache
    );

    let convertedValue = Number(price.price) * position.quantity;
    if (fxRate) {
      convertedValue *= fxRate;
    } else if (price.currency !== displayCurrency) {
      warnings.push("Missing FX rate for some stock prices. Using native currency values.");
    }

    let convertedInvested = position.invested;
    if (fxRate) {
      convertedInvested = position.invested * fxRate;
    } else if (price.currency !== displayCurrency) {
      warnings.push("Missing FX rate for some stock cost basis values.");
    }
    stocksTotal += convertedValue;

    const gainAbs = convertedInvested ? convertedValue - convertedInvested : null;
    const gainPct = convertedInvested ? (gainAbs / convertedInvested) * 100 : null;

    stockItems.push({
      label: position.stockName,
      value: round(convertedValue),
      invested: round(convertedInvested),
      gainAbs: gainAbs === null ? null : round(gainAbs),
      gainPct: gainPct === null ? null : round(gainPct),
      category: position.stockType === 1 ? AssetCategory.US_STOCKS : AssetCategory.IND_STOCKS,
    });
  }

  const filteredSnapshotItems = snapshotItems.filter((item) => {
    if ([AssetCategory.US_STOCKS, AssetCategory.IND_STOCKS].includes(item.category)) {
      return !usedFallback.has(item.label);
    }
    return true;
  });

  const snapshotsTotal = filteredSnapshotItems.reduce((sum, item) => sum + item.value, 0);
  const effectiveSnapshots = filteredSnapshotItems;

  let realEstateTotal = 0;
  for (const valuation of latestRealEstate) {
    const fxRate = await getFxRate(
      userId,
      valuation.currency as Currency,
      displayCurrency,
      valuation.asOfDate,
      fxCache
    );
    let convertedValue = Number(valuation.value);
    if (fxRate) {
      convertedValue *= fxRate;
    } else if (valuation.currency !== displayCurrency) {
      warnings.push("Missing FX rate for some real estate valuations.");
    }
    realEstateTotal += convertedValue;
  }

  let liabilityTotal = 0;
  for (const liability of liabilities) {
    const snapshot = latestLiabilitySnapshots.find((item) => item.liabilityId === liability.id);
    if (snapshot) {
      liabilityTotal += Number(snapshot.outstanding);
    } else if (liability.principal) {
      liabilityTotal += Number(liability.principal);
      warnings.push("Missing liability snapshots for some entries; using principal.");
    }
  }

  const assetTotal = stocksTotal + snapshotsTotal + realEstateTotal;

  const monthlyStart = startOfMonth(now);
  const monthlyTxns = await prisma.transaction.findMany({
    where: {
      userId,
      txnDate: { gte: monthlyStart },
      txnAction: { in: [TxnAction.BUY, TxnAction.DEPOSIT] },
    },
  });

  let monthlyInvestmentsValue = 0;
  for (const txn of monthlyTxns) {
    const fxRate = await getFxRate(
      userId,
      txn.currency as Currency,
      displayCurrency,
      txn.txnDate,
      fxCache
    );
    let convertedAmount = Number(txn.amount);
    if (fxRate) {
      convertedAmount *= fxRate;
    } else if (txn.currency !== displayCurrency) {
      warnings.push("Missing FX rate for monthly investments.");
    }
    monthlyInvestmentsValue += convertedAmount;
  }

  const metrics = {
    realEstate: round(realEstateTotal),
    liabilities: round(liabilityTotal),
    investments: round(assetTotal - realEstateTotal),
    monthlyInvestments: round(monthlyInvestmentsValue),
    netWorth: round(assetTotal - liabilityTotal),
  };

  const allocationMap = new Map<string, number>();

  for (const stock of stockItems) {
    const label = stock.category === AssetCategory.US_STOCKS ? "US Stocks" : "IND Stocks";
    allocationMap.set(label, (allocationMap.get(label) ?? 0) + stock.value);
  }

  for (const snap of effectiveSnapshots) {
    if ([AssetCategory.METALS, AssetCategory.CRYPTO].includes(snap.category)) {
      const label = "Metals & Crypto";
      allocationMap.set(label, (allocationMap.get(label) ?? 0) + snap.value);
    } else if (snap.category === AssetCategory.RETIRALS) {
      allocationMap.set("Retirals", (allocationMap.get("Retirals") ?? 0) + snap.value);
    } else if (snap.category === AssetCategory.MF) {
      allocationMap.set("MF", (allocationMap.get("MF") ?? 0) + snap.value);
    } else if (snap.category === AssetCategory.CASH) {
      allocationMap.set("Cash & Bank", (allocationMap.get("Cash & Bank") ?? 0) + snap.value);
    } else {
      allocationMap.set("Other", (allocationMap.get("Other") ?? 0) + snap.value);
    }
  }

  if (realEstateTotal > 0) {
    allocationMap.set("Real Estate", (allocationMap.get("Real Estate") ?? 0) + realEstateTotal);
  }

  const allocationOrder = [
    "MF",
    "US Stocks",
    "IND Stocks",
    "Metals & Crypto",
    "Retirals",
    "Real Estate",
    "Cash & Bank",
    "Other",
  ];

  const allocationItems = allocationOrder
    .filter((label) => allocationMap.has(label))
    .map((label) => ({
      category: label,
      value: round(allocationMap.get(label) ?? 0),
    }));

  const tiles = [
    { category: "MF", filter: (item: typeof snapshotItems[number]) => item.category === AssetCategory.MF },
    {
      category: "US Stocks",
      filter: (item: typeof stockItems[number]) => item.category === AssetCategory.US_STOCKS,
    },
    {
      category: "IND Stocks",
      filter: (item: typeof stockItems[number]) => item.category === AssetCategory.IND_STOCKS,
    },
    {
      category: "Metals & Crypto",
      filter: (item: typeof snapshotItems[number]) =>
        [AssetCategory.METALS, AssetCategory.CRYPTO].includes(item.category),
    },
    {
      category: "Retirals",
      filter: (item: typeof snapshotItems[number]) => item.category === AssetCategory.RETIRALS,
    },
  ];

  const tileData = tiles.map((tile) => {
    const items = [
      ...stockItems.filter((item) => tile.filter(item as typeof stockItems[number])),
      ...effectiveSnapshots.filter((item) => tile.filter(item as typeof snapshotItems[number])),
    ].sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);

    return {
      category: tile.category,
      total: round(total),
      items: items.map((item) => ({
        label: item.label,
        value: round(item.value),
        invested: item.invested ?? null,
        gainAbs: item.gainAbs ?? null,
        gainPct: item.gainPct ?? null,
        allocationPct: total ? (item.value / total) * 100 : 0,
      })),
    };
  });

  const buckets = buildBucketDates(range, now);

  const priceHistory = stockPrices.reduce((map, price) => {
    const list = map.get(price.stockId) ?? [];
    list.push({
      date: price.asOfDate,
      price: Number(price.price),
      currency: price.currency as Currency,
    });
    map.set(price.stockId, list);
    return map;
  }, new Map<number, { date: Date; price: number; currency: Currency }[]>());

  for (const list of priceHistory.values()) {
    list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  const transactionsByDate = transactions
    .filter((txn) => txn.stockId && [TxnAction.BUY, TxnAction.SELL].includes(txn.txnAction))
    .sort((a, b) => a.txnDate.getTime() - b.txnDate.getTime());

  const runningPositions = new Map<number, { quantity: number; costBasis: number; stockType: number; name: string }>();
  let txnIndex = 0;

  const trendPoints: { date: string; value: number }[] = [];

  for (const bucket of buckets) {
    while (txnIndex < transactionsByDate.length && transactionsByDate[txnIndex].txnDate <= bucket) {
      const txn = transactionsByDate[txnIndex];
      if (!txn.stockId || !txn.stock) {
        txnIndex += 1;
        continue;
      }
      const current = runningPositions.get(txn.stockId) ?? {
        quantity: 0,
        costBasis: 0,
        stockType: txn.stock.type,
        name: txn.stock.name,
      };
      const qty = Number(txn.quantity ?? 0);
      const unitPrice = Number(txn.unitPrice ?? 0);
      const fees = Number(txn.fees ?? 0);

      if (txn.txnAction === TxnAction.BUY) {
        current.quantity += qty;
        current.costBasis += qty * unitPrice + fees;
      } else if (txn.txnAction === TxnAction.SELL && current.quantity > 0) {
        const avgCost = current.costBasis / current.quantity;
        current.quantity -= qty;
        current.costBasis -= avgCost * qty;
      }

      runningPositions.set(txn.stockId, current);
      txnIndex += 1;
    }

    let bucketAssets = 0;

    for (const [stockId, position] of runningPositions.entries()) {
      const priceList = priceHistory.get(stockId) ?? [];
      const price = [...priceList].reverse().find((entry) => entry.date <= bucket);
      if (!price || position.quantity <= 0) {
        continue;
      }
      const fxRate = await getFxRate(userId, price.currency, displayCurrency, bucket, fxCache);
      let value = price.price * position.quantity;
      if (fxRate) {
        value *= fxRate;
      }
      bucketAssets += value;
    }

    const snapshotAsOf = mergeLatest(
      holdingSnapshotsRaw.filter((snap) => snap.asOfDate <= bucket),
      (snap) => `${snap.label}-${snap.assetCategory}-${snap.platformAccountId ?? 0}`
    );

    for (const snap of snapshotAsOf) {
      const fxRate = await getFxRate(
        userId,
        snap.currency as Currency,
        displayCurrency,
        snap.asOfDate,
        fxCache
      );
      let value = Number(snap.value);
      if (fxRate) {
        value *= fxRate;
      }
      bucketAssets += value;
    }

    const realEstateAsOf = mergeLatest(
      realEstateRaw.filter((valuation) => valuation.asOfDate <= bucket),
      (valuation) => valuation.propertyName
    );

    for (const valuation of realEstateAsOf) {
      const fxRate = await getFxRate(
        userId,
        valuation.currency as Currency,
        displayCurrency,
        valuation.asOfDate,
        fxCache
      );
      let value = Number(valuation.value);
      if (fxRate) {
        value *= fxRate;
      }
      bucketAssets += value;
    }

    const liabilitiesAsOf = mergeLatest(
      liabilitySnapshotsRaw.filter((snap) => snap.asOfDate <= bucket),
      (snap) => String(snap.liabilityId)
    );

    let bucketLiabilities = 0;
    for (const liability of liabilities) {
      const snapshot = liabilitiesAsOf.find((snap) => snap.liabilityId === liability.id);
      if (snapshot) {
        bucketLiabilities += Number(snapshot.outstanding);
      } else if (liability.principal) {
        bucketLiabilities += Number(liability.principal);
      }
    }

    trendPoints.push({
      date: bucket.toISOString().slice(0, 10),
      value: round(bucketAssets - bucketLiabilities),
    });
  }

  const payload = {
    currency: displayCurrency,
    metrics,
    trend: { range, points: trendPoints },
    allocation: {
      total: round(allocationItems.reduce((sum, item) => sum + item.value, 0)),
      items: allocationItems,
    },
    tiles: tileData,
    warnings: Array.from(new Set(warnings)),
  };

  if (cache) {
    await cache.set(cacheKey, payload, { ex: 300 });
  }

  return NextResponse.json(payload);
}

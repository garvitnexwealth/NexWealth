import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

async function checkDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("[startup] DATABASE_URL not set; skipping DB check.");
    return;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("[startup] Postgres connection OK.");
  } catch (error) {
    console.error("[startup] Postgres connection failed.", error);
  }
}

async function checkRedis() {
  const redis = getRedis();
  if (!redis) {
    console.warn("[startup] Upstash Redis not configured; skipping Redis check.");
    return;
  }
  try {
    const pong = await redis.ping();
    if (pong === "PONG") {
      console.log("[startup] Redis connection OK.");
    } else {
      console.warn("[startup] Redis ping returned unexpected response.", pong);
    }
  } catch (error) {
    console.error("[startup] Redis connection failed.", error);
  }
}

export async function register() {
  await Promise.all([checkDatabase(), checkRedis()]);
}

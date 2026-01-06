import { getRedis } from "@/lib/redis";

export async function invalidateDashboardCache(userId: number) {
  const redis = getRedis();
  if (!redis) {
    return;
  }
  const pattern = `dashboard:${userId}:*`;
  const keys = await redis.keys(pattern);
  if (keys.length) {
    await redis.del(...keys);
  }
}

import Redis from 'ioredis';

// Tiempo de caché por defecto: 1 semana
const DEFAULT_CACHE_TIME = 7 * 24 * 60 * 60;

let redis: Redis | null = null;

if (typeof window === 'undefined') {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
}

export async function getFromCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
}

export async function setInCache(key: string, data: any, expireTime = DEFAULT_CACHE_TIME): Promise<void> {
  if (!redis) return;
  await redis.setex(key, expireTime, JSON.stringify(data));
}

export default redis; 
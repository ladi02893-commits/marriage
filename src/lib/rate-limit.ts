type Entry = { count: number; resetAt: number };

const attempts = new Map<string, Entry>();

export function checkRateLimit(
  key: string,
  limit = 8,
  windowMs = 15 * 60 * 1000,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  current.count += 1;
  if (attempts.size > 10_000) {
    for (const [entryKey, entry] of attempts) {
      if (entry.resetAt <= now) attempts.delete(entryKey);
    }
  }

  return {
    allowed: current.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function clearRateLimit(key: string): void {
  attempts.delete(key);
}

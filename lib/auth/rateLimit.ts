// filepath: lib/auth/rateLimit.ts

interface RateLimitRecord {
  attempts: number;
  resetAt: number;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const attemptsStore = new Map<string, RateLimitRecord>();

/**
 * Checks whether an attempt is allowed for the given key (IP + username).
 */
export function checkRateLimit(key: string): {
  allowed: boolean;
  remainingSeconds: number;
} {
  const now = Date.now();
  const record = attemptsStore.get(key);

  if (!record || now > record.resetAt) {
    return { allowed: true, remainingSeconds: 0 };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    const remainingSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  return { allowed: true, remainingSeconds: 0 };
}

/**
 * Records a failed attempt for the given key.
 */
export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = attemptsStore.get(key);

  if (!record || now > record.resetAt) {
    attemptsStore.set(key, {
      attempts: 1,
      resetAt: now + WINDOW_MS,
    });
    return;
  }

  record.attempts += 1;
}

/**
 * Resets the attempt counter on successful login.
 */
export function resetRateLimit(key: string): void {
  attemptsStore.delete(key);
}

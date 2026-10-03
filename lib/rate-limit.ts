// One shared limiter for this local, single-process app. No IPs or transcripts are stored.
// A multi-instance public deployment needs a shared atomic store before enabling chat.
export function createRateLimiter() {
  let minuteStart = 0, dayStart = 0, minuteCount = 0, dayCount = 0;
  return (now: number, perMinute: number, perDay: number) => {
    if (now - minuteStart >= 60_000) { minuteStart = now; minuteCount = 0; }
    if (now - dayStart >= 86_400_000) { dayStart = now; dayCount = 0; }
    if (minuteCount >= perMinute) return { allowed: false, retryAfter: Math.max(1, Math.ceil((minuteStart + 60_000 - now) / 1000)) };
    if (dayCount >= perDay) return { allowed: false, retryAfter: Math.max(1, Math.ceil((dayStart + 86_400_000 - now) / 1000)) };
    minuteCount++; dayCount++;
    return { allowed: true, retryAfter: 0 };
  };
}
const globalState = globalThis as typeof globalThis & { daviidLimiter?: ReturnType<typeof createRateLimiter>; daviidInFlight?: number };
export const checkRateLimit = globalState.daviidLimiter ??= createRateLimiter();
export function acquireRequest() { if ((globalState.daviidInFlight ?? 0) >= 2) return false; globalState.daviidInFlight = (globalState.daviidInFlight ?? 0) + 1; return true; }
export function releaseRequest() { globalState.daviidInFlight = Math.max(0, (globalState.daviidInFlight ?? 1) - 1); }
export function boundedLimit(value: string | undefined, fallback: number, maximum: number) { const number = Number(value); return Number.isInteger(number) && number > 0 ? Math.min(number, maximum) : fallback; }

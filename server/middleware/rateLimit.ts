// server/middleware/rateLimit.ts
import type { Request, Response, NextFunction } from "express";
import { RATE_LIMIT_MAX_REQ, RATE_LIMIT_WINDOW_SEC } from "../env";
import { getOwnerKey } from "../utils/ownerKey";

type Bucket = { windowStartMs: number; count: number };
const buckets = new Map<string, Bucket>();

export function rateLimitAI() {
  const windowMs = Math.max(1, RATE_LIMIT_WINDOW_SEC) * 1000;
  const maxReq = Math.max(1, RATE_LIMIT_MAX_REQ);

  return function rl(req: Request, res: Response, next: NextFunction) {
    const owner = getOwnerKey(req);
    const key = `${owner}::${req.path}`;

    const now = Date.now();
    const b = buckets.get(key);

    if (!b || now - b.windowStartMs >= windowMs) {
      buckets.set(key, { windowStartMs: now, count: 1 });
      return next();
    }

    b.count += 1;
    buckets.set(key, b);

    if (b.count > maxReq) {
      const retryAfterSec = Math.ceil((b.windowStartMs + windowMs - now) / 1000);
      res.setHeader("Retry-After", String(Math.max(1, retryAfterSec)));
      return res.status(429).json({
        error: "Too many requests. Slow down.",
        retryAfterSec: Math.max(1, retryAfterSec),
      });
    }

    return next();
  };
}

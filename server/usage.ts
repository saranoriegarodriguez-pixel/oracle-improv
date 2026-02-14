// server/usage.ts
import { Router } from "express";
import type { Request, Response } from "express";

import { MAX_SESSIONS_PER_DAY } from "./env";

// ✅ sesión Google
import { getSessionUser } from "./auth/sessions";

// ✅ contador diario (tu limits.ts ya lo expone así)
import { getUsageForUser } from "./middleware/limits";

export const usageRouter = Router();

/**
 * GET /api/usage/:username
 * Source of truth:
 * - si hay sesión -> owner = email (ignora param)
 * - si no hay sesión -> fallback a param (útil para Ollama/local)
 */
usageRouter.get("/usage/:username", (req: Request, res: Response) => {
  try {
    const param = String(req.params.username ?? "").trim().toLowerCase();

    const user = getSessionUser(req);
    const email = user?.email ? String(user.email).trim().toLowerCase() : "";

    // ✅ owner real
    const owner = email || param;

    if (!owner) {
      return res.status(400).json({
        error: "Missing owner (username/email).",
      });
    }

    const used = getUsageForUser(owner);
    const limit = MAX_SESSIONS_PER_DAY;
    const remaining = Math.max(0, limit - used);

    // (dayKey lo lleva el store; si lo quieres exacto aquí,
    // podrías exportarlo desde limits.ts. Si no, lo omitimos.)
    return res.json({
      used,
      limit,
      remaining,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? "usage error" });
  }
});

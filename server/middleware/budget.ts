// server/middleware/budget.ts
import type { Request, Response, NextFunction } from "express";

import { USD_PER_EUR } from "../env.js";
import { getBudgetStatus } from "../store/budgetStore.js";

/**
 * Enforce monthly budget cutoff (EUR).
 * - Solo debería aplicarse a endpoints OpenAI (en index.ts ya lo gateas por provider).
 * - Este middleware NO incrementa gasto, solo bloquea si ya estás pasado.
 */
export function enforceMonthlyBudget() {
  return (req: Request, res: Response, next: NextFunction) => {
    const body = (req.body ?? {}) as any;

    // Extra guard: si el provider NO es openai, no bloquees nunca (Ollama gratis)
    if (body.provider && String(body.provider).toLowerCase() !== "openai") {
      return next();
    }

    const username = String(body.username ?? "").trim().toLowerCase();

    // misma convención que tu budget router
    const ownerKey = username
      ? `user:${username}`
      : `ip:${(req.ip || "unknown").replace(/[^0-9a-fA-F:.,]/g, "")}`;

    const st = getBudgetStatus(ownerKey);

    const usdPerEur = Number(USD_PER_EUR || 1);
    const eurSpent = usdPerEur > 0 ? st.usdSpent / usdPerEur : st.usdSpent;

    const overCutoff = eurSpent >= st.eurCutoff;

    if (overCutoff) {
      return res.status(429).json({
        ok: false,
        code: "MONTHLY_BUDGET_CUTOFF",
        message: "Monthly budget cutoff reached.",
        ownerKey,
        monthKey: st.monthKey,
        eurSpent: Number(eurSpent.toFixed(6)),
        eurCutoff: st.eurCutoff,
        eurBudget: st.eurBudget,
      });
    }

    next();
  };
}

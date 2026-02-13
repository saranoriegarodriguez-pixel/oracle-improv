import { Router, type Request, type Response } from "express";
import { USD_PER_EUR } from "./env.js";
import { getBudgetStatus } from "./store/budgetStore.js";

export const budgetRouter = Router();

/**
 * GET /api/budget/:username
 * Devuelve gasto mensual estimado (en USD y EUR) y límite/cutoff configurados.
 */
budgetRouter.get("/budget/:username", (req: Request, res: Response) => {
  const username = String(req.params.username ?? "")
    .trim()
    .toLowerCase();

  // usamos la misma convención que limits/budget guard
  const ownerKey = username ? `user:${username}` : "ip:unknown";

  const st = getBudgetStatus(ownerKey);

  const usdPerEur = Number(USD_PER_EUR || 1);

  const eurSpent =
    usdPerEur > 0 ? st.usdSpent / usdPerEur : st.usdSpent;

  res.json({
    username,
    monthKey: st.monthKey,

    // gasto acumulado
    usdSpent: Number(st.usdSpent.toFixed(6)),
    eurSpent: Number(eurSpent.toFixed(6)),

    // límites config
    eurBudget: st.eurBudget,
    eurCutoff: st.eurCutoff,

    // para UI
    remainingToCutoffEur: Number(
      Math.max(0, st.eurCutoff - eurSpent).toFixed(6)
    ),
    overCutoff: eurSpent >= st.eurCutoff,
  });
});

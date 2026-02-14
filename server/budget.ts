// server/budget.ts
import { Router, type Request, type Response } from "express";
import { USD_PER_EUR } from "./env.js";
import { getBudgetStatus } from "./store/budgetStore.js";

// ✅ Google session (cookie sid)
import { getSessionUser } from "./auth/sessions.js";

export const budgetRouter = Router();

/**
 * GET /api/budget/:username
 * Source of truth:
 * - si hay sesión -> owner = email (ignora param)
 * - si no hay sesión -> fallback a param (útil para local/dev)
 *
 * Devuelve gasto mensual estimado (USD/EUR) + límite/cutoff + datos para UI.
 */
budgetRouter.get("/budget/:username", (req: Request, res: Response) => {
  const param = String(req.params.username ?? "").trim().toLowerCase();

  const user = getSessionUser(req);
  const email = user?.email ? String(user.email).trim().toLowerCase() : "";

  // ✅ owner real
  const ownerUsername = email || param;

  // misma convención que limits/budget guard
  const ownerKey = ownerUsername ? `user:${ownerUsername}` : "ip:unknown";

  const st = getBudgetStatus(ownerKey);

  const usdPerEur = Number(USD_PER_EUR || 1);
  const eurSpent = usdPerEur > 0 ? st.usdSpent / usdPerEur : st.usdSpent;

  return res.json({
    // ✅ “username” que devuelve la API = owner real (email si existe)
    username: ownerUsername,
    monthKey: st.monthKey,

    // gasto acumulado
    usdSpent: Number(st.usdSpent.toFixed(6)),
    eurSpent: Number(eurSpent.toFixed(6)),

    // límites config
    eurBudget: st.eurBudget,
    eurCutoff: st.eurCutoff,

    // para UI
    remainingToCutoffEur: Number(Math.max(0, st.eurCutoff - eurSpent).toFixed(6)),
    overCutoff: eurSpent >= st.eurCutoff,
  });
});

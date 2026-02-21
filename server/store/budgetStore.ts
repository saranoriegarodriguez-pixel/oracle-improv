// server/store/budgetStore.ts
import path from "path";
import { DATA_DIR, MONTHLY_BUDGET_EUR, MONTHLY_CUTOFF_EUR } from "../env.js";
import { readJsonFile, writeJsonFileAtomic } from "./persist.js";

type OwnerKey = string; // user:sara | ip:...
type MonthKey = string; // YYYY-MM

type StoreShape = {
  monthly: Record<string, { usdSpent: number; updatedAt: number }>;
};

const FILE = path.join(DATA_DIR, "budget.json");
let cache: StoreShape = readJsonFile(FILE, { monthly: {} });

function save() {
  writeJsonFileAtomic(FILE, cache);
}

function monthKeyNow(d = new Date()): MonthKey {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

export function getBudgetStatus(ownerKey: OwnerKey) {
  const mk = monthKeyNow();
  const key = `${mk}::${ownerKey}`;
  const usdSpent = cache.monthly[key]?.usdSpent ?? 0;

  return {
    monthKey: mk,
    usdSpent,
    eurBudget: MONTHLY_BUDGET_EUR,
    eurCutoff: MONTHLY_CUTOFF_EUR,
  };
}

export function addUsdSpend(ownerKey: OwnerKey, usd: number) {
  const mk = monthKeyNow();
  const key = `${mk}::${ownerKey}`;
  const cur = cache.monthly[key]?.usdSpent ?? 0;

  cache.monthly[key] = {
    usdSpent: cur + Math.max(0, usd),
    updatedAt: Date.now(),
  };

  save();
}

export function isOverCutoff(ownerKey: OwnerKey, usdPerEur: number) {
  const { usdSpent } = getBudgetStatus(ownerKey);
  const cutoffUsd = MONTHLY_CUTOFF_EUR * (usdPerEur || 1);
  return usdSpent >= cutoffUsd;
}
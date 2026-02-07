// src/api/budget.ts
export type BudgetResponse = {
  username: string;
  monthKey: string;

  usdSpent: number;
  eurSpent: number;

  eurBudget: number;
  eurCutoff: number;

  remainingToCutoffEur: number;
  overCutoff: boolean;
};

export async function fetchBudget(username: string): Promise<BudgetResponse> {
  const u = String(username ?? "").trim().toLowerCase();

  const r = await fetch(`/api/budget/${encodeURIComponent(u)}`, {
    method: "GET",
  });

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`budget ${r.status}: ${text || "request failed"}`);
  }

  return (await r.json()) as BudgetResponse;
}

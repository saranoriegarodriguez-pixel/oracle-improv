// src/state/profileSummaries.ts

export type OracleSummary = {
  ts: number; // Date.now()
  username: string;
  sessionId: string;
  mode: "train" | "scene" | "trial";
  exerciseId: string; // "E1"..."E12"
  charSlug: string;

  // NUEVO: resumen del oráculo (opcionales)
  recommendation?: string; // 1 frase
  mistakes?: string[];      // 0..N
  tips?: string[];          // 0..N
  penalty?: string;         // solo si hay fallos (o si server lo manda)
};

const SUMMARIES_KEY = "oracle.profile.summaries.v1";
const MAX_ITEMS = 10;

function safeString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s ? s : undefined;
}

function safeStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.map((x) => String(x).trim()).filter(Boolean);
  return out.length ? out : undefined;
}

function normalizeOne(x: any): OracleSummary | null {
  if (!x || typeof x !== "object") return null;

  const ts = typeof x.ts === "number" ? x.ts : Number(x.ts);
  const username = safeString(x.username) ?? "guest";
  const sessionId = safeString(x.sessionId) ?? "";
  const mode = x.mode === "train" || x.mode === "scene" || x.mode === "trial" ? x.mode : null;
  const exerciseId = safeString(x.exerciseId) ?? "";
  const charSlug = safeString(x.charSlug) ?? "";

  if (!Number.isFinite(ts) || !mode || !exerciseId || !charSlug) return null;

  const recommendation = safeString(x.recommendation);
  const mistakes = safeStringArray(x.mistakes);
  const tips = safeStringArray(x.tips);
  const penalty = safeString(x.penalty);

  return {
    ts,
    username: username.trim().toLowerCase(),
    sessionId,
    mode,
    exerciseId,
    charSlug,
    recommendation,
    mistakes,
    tips,
    penalty,
  };
}

export function loadSummaries(): OracleSummary[] {
  try {
    const raw = localStorage.getItem(SUMMARIES_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const items = parsed
      .map(normalizeOne)
      .filter(Boolean) as OracleSummary[];

    // orden desc
    items.sort((a, b) => b.ts - a.ts);

    // cap
    return items.slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function saveSummary(item: OracleSummary) {
  try {
    const existing = loadSummaries();

    // normaliza username minúsculas
    const nextItem: OracleSummary = {
      ...item,
      username: (item.username ?? "guest").trim().toLowerCase(),
      mistakes: item.mistakes?.filter(Boolean),
      tips: item.tips?.filter(Boolean),
      recommendation: item.recommendation?.trim() || undefined,
      penalty: item.penalty?.trim() || undefined,
    };

    // evita duplicados por sessionId (si re-entras o doble guardado)
    const filtered = existing.filter((s) => s.sessionId !== nextItem.sessionId);

    const next = [nextItem, ...filtered]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, MAX_ITEMS);

    localStorage.setItem(SUMMARIES_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function clearSummaries() {
  try {
    localStorage.removeItem(SUMMARIES_KEY);
  } catch {
    // ignore
  }
}

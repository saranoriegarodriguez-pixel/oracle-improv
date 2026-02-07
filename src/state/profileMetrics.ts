// src/state/profileMetrics.ts
export type MetricKey = "clarity" | "desire" | "listening" | "status" | "ending";
export type MetricsState = Record<MetricKey, number>;

const METRICS_KEY = "oracle.profile.metrics.v3";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function empty(): MetricsState {
  return { clarity: 0, desire: 0, listening: 0, status: 0, ending: 0 };
}

type LegacyMetricsState = {
  clarity?: unknown;
  desire?: unknown;
  listening?: unknown;
  status?: unknown;
  // legado
  closure?: unknown;
  // nuevo
  ending?: unknown;
};

export function loadProfileMetrics(): MetricsState {
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    if (!raw) return empty();

    const p = JSON.parse(raw) as LegacyMetricsState;

    const next: MetricsState = {
      clarity: clamp(Number(p.clarity ?? 0), 0, 100),
      desire: clamp(Number(p.desire ?? 0), 0, 100),
      listening: clamp(Number(p.listening ?? 0), 0, 100),
      status: clamp(Number(p.status ?? 0), 0, 100),
      ending: clamp(Number(p.ending ?? p.closure ?? 0), 0, 100),
    };

    // ✅ Migración: si venía "closure" y no "ending", lo reescribimos ya normalizado
    const hadClosure = typeof (p as any)?.closure !== "undefined";
    const hadEnding = typeof (p as any)?.ending !== "undefined";
    if (hadClosure && !hadEnding) {
      localStorage.setItem(METRICS_KEY, JSON.stringify(next));
    }

    return next;
  } catch {
    return empty();
  }
}

export function addSessionPoints(delta: Partial<MetricsState>) {
  const cur = loadProfileMetrics();

  const next: MetricsState = {
    clarity: clamp(cur.clarity + Number(delta.clarity ?? 0), 0, 100),
    desire: clamp(cur.desire + Number(delta.desire ?? 0), 0, 100),
    listening: clamp(cur.listening + Number(delta.listening ?? 0), 0, 100),
    status: clamp(cur.status + Number(delta.status ?? 0), 0, 100),
    ending: clamp(cur.ending + Number(delta.ending ?? 0), 0, 100),
  };

  localStorage.setItem(METRICS_KEY, JSON.stringify(next));
}

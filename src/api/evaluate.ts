// src/api/evaluate.ts
import type { ChatMessage } from "./chat";

/** ✅ 5 habilidades del oráculo (0..20) */
export type OracleSkill = "clarity" | "desire" | "listening" | "status" | "ending";
export type OraclePoints = Record<OracleSkill, number>;
export type OracleEvidence = Record<OracleSkill, string[]>;

export type EvaluateRequest = {
  lang: "es" | "en";
  mode: "train" | "scene" | "trial";
  level: 1 | 2 | 3 | 4;
  exerciseId: string; // "E1".."E12"
  charSlug: string;
  master: boolean;
  auto: boolean;

  messages: ChatMessage[];
  transcript?: string;

  // optional provider override
  provider?: "ollama" | "openai";
  model?: string;

  // (si tu server lo usa)
  sessionId?: string;
  username?: string;
};

/**
 * ✅ Respuesta “ideal” del oráculo (JSON puro)
 * El server debería devolver esto: { points, evidence, text, ... }
 */
export type OracleJson = {
  points: OraclePoints;
  evidence: OracleEvidence;
  text: string;

  // ✅ nuevos campos (para Profile: fallos / consejos / castigo / recomendación)
  recommendation?: string;
  mistakes?: string[];
  tips?: string[];
  penalty?: string;
};

/**
 * ✅ Respuesta flexible:
 * - Puede venir ya en formato OracleJson
 * - O venir en formato chat: message/choices/output con JSON dentro del texto
 */
export type EvaluateResponse =
  Partial<OracleJson> & {
    message?: { role: "assistant"; content: string };
    raw?: any;
    choices?: Array<{ message?: { content?: string } }>;
    output?: { content?: string };
    [k: string]: any;
  };

/** ✅ POST /api/evaluate */
export async function sendEvaluate(body: EvaluateRequest): Promise<EvaluateResponse> {
  const res = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** helper para extraer texto cuando viene en formato chat */
export function pickText(out: EvaluateResponse): string {
  return (
    out?.text ??
    out?.message?.content ??
    out?.choices?.[0]?.message?.content ??
    out?.output?.content ??
    ""
  );
}

/** ✅ defaults seguros */
export function emptyPoints(): OraclePoints {
  return { clarity: 0, desire: 0, listening: 0, status: 0, ending: 0 };
}

export function emptyEvidence(): OracleEvidence {
  return { clarity: [], desire: [], listening: [], status: [], ending: [] };
}

/** clamp 0..20 */
function clamp20(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(20, Math.round(x)));
}

/**
 * ✅ intenta parsear JSON aunque venga envuelto en texto
 */
export function tryParseOracleJson(text: string): Partial<OracleJson> | null {
  if (!text) return null;

  // 1) intento directo
  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj === "object") return obj as any;
  } catch {}

  // 2) intenta extraer el primer bloque {...}
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const slice = text.slice(start, end + 1);
    try {
      const obj = JSON.parse(slice);
      if (obj && typeof obj === "object") return obj as any;
    } catch {}
  }

  return null;
}

/**
 * ✅ Normaliza cualquier respuesta del server a:
 * { points, evidence, text, recommendation, mistakes, tips, penalty }
 *
 * - Si el server ya te devuelve points/evidence/text, lo usa.
 * - Si te devuelve message.content con JSON dentro, lo parsea.
 * - Siempre aplica defaults + clamp 0..20.
 */
export function normalizeOracle(out: EvaluateResponse): OracleJson {
  const direct =
    out &&
    typeof out === "object" &&
    ((out as any).points || (out as any).evidence || (out as any).text)
      ? (out as Partial<OracleJson>)
      : null;

  const fromText = tryParseOracleJson(pickText(out));
  const src: Partial<OracleJson> = direct ?? fromText ?? {};

  const p: any = src.points ?? {};
  const e: any = src.evidence ?? {};

  const points: OraclePoints = {
    clarity: clamp20(p.clarity),
    desire: clamp20(p.desire),
    listening: clamp20(p.listening),
    status: clamp20(p.status),
    ending: clamp20(p.ending),
  };

  const evidence: OracleEvidence = {
    clarity: Array.isArray(e.clarity) ? e.clarity.map(String) : [],
    desire: Array.isArray(e.desire) ? e.desire.map(String) : [],
    listening: Array.isArray(e.listening) ? e.listening.map(String) : [],
    status: Array.isArray(e.status) ? e.status.map(String) : [],
    ending: Array.isArray(e.ending) ? e.ending.map(String) : [],
  };

  const text =
    typeof (src as any).text === "string" && (src as any).text.trim()
      ? (src as any).text
      : pickText(out) || "";

  // ✅ NUEVO: fallos / consejos / castigo / recomendación
  const recommendation =
    typeof (src as any).recommendation === "string"
      ? (src as any).recommendation
      : undefined;

  const mistakes = Array.isArray((src as any).mistakes)
    ? (src as any).mistakes.map(String).filter(Boolean)
    : [];

  const tips = Array.isArray((src as any).tips)
    ? (src as any).tips.map(String).filter(Boolean)
    : [];

  const penalty =
    typeof (src as any).penalty === "string" ? (src as any).penalty : undefined;

  return { points, evidence, text, recommendation, mistakes, tips, penalty };
}

/** ✅ suma total (0..100) */
export function sumPoints(points: OraclePoints): number {
  return points.clarity + points.desire + points.listening + points.status + points.ending;
}

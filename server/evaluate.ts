// server/evaluate.ts
import type { Request, Response } from "express";
import type { ProviderName, ChatMessage as ProviderChatMessage } from "./types";
import { AI_PROVIDER } from "./env";
import { chatWithOllama } from "./providers/ollama";
import { chatWithOpenAI } from "./providers/openai";

/* =========================================================
   TIPOS (frontend espera estos campos)
========================================================= */

type OracleSkill = "clarity" | "desire" | "listening" | "status" | "ending";
type OraclePoints = Record<OracleSkill, number>;
type OracleEvidence = Record<OracleSkill, string[]>;

export type EvaluateBody = {
  lang: "es" | "en";
  mode: "train" | "scene" | "trial";
  level: 1 | 2 | 3 | 4;
  exerciseId: string;
  charSlug: string;
  master: boolean;
  auto: boolean;

  messages: ProviderChatMessage[];
  transcript?: string;

  provider?: ProviderName;
  model?: string;

  sessionId?: string;
  username?: string;
};

type OracleJson = {
  points: OraclePoints;
  evidence: OracleEvidence;
  text: string;

  recommendation?: string;
  mistakes?: string[];
  tips?: string[];
  penalty?: string;
};

/* =========================================================
   UTILIDADES
========================================================= */

function clamp20(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(20, Math.round(x)));
}

function normalizeOracle(obj: any): OracleJson {
  const p = obj?.points ?? {};
  const e = obj?.evidence ?? {};

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

  const text = typeof obj?.text === "string" ? obj.text : "";

  const recommendation =
    typeof obj?.recommendation === "string" ? obj.recommendation : undefined;

  const tips = Array.isArray(obj?.tips) ? obj.tips.map(String).filter(Boolean) : undefined;

  const mistakes = Array.isArray(obj?.mistakes)
    ? obj.mistakes.map(String).filter(Boolean)
    : undefined;

  const penalty = typeof obj?.penalty === "string" ? obj.penalty : undefined;

  return { points, evidence, text, recommendation, tips, mistakes, penalty };
}

function safeParseOracleJson(raw: string): any {
  if (!raw) throw new Error("Oracle returned empty response");

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {}

  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    const sliced = raw.slice(first, last + 1);
    return JSON.parse(sliced);
  }

  throw new Error("Oracle did not return valid JSON");
}

function safeStringify(x: unknown): string {
  try {
    return JSON.stringify(x);
  } catch {
    return "[]";
  }
}

function sumPoints(points: OraclePoints): number {
  return points.clarity + points.desire + points.listening + points.status + points.ending;
}

/* =========================================================
   PROMPT DEL ORÁCULO (fuerza JSON + rubric)
========================================================= */

function buildOracleSystemPrompt(b: EvaluateBody): string {
  const isES = b.lang === "es";

  const coachLine = isES
    ? "Eres el ORÁCULO: profesor experto en improvisación teatral. Sé exigente, concreto y útil."
    : "You are the ORACLE: an expert improv coach. Be strict, concrete, and useful.";

  const context = isES
    ? `Contexto: modo=${b.mode}, nivel=${b.level}, ejercicio=${b.exerciseId}, personaje=${b.charSlug}.`
    : `Context: mode=${b.mode}, level=${b.level}, exercise=${b.exerciseId}, character=${b.charSlug}.`;

  const rubric = isES
    ? [
        "RÚBRICA rápida por habilidad:",
        "- clarity: acción + lugar + quién hace qué (sin confusión).",
        "- desire: objetivo explícito / necesidad / apuesta.",
        "- listening: responde a lo anterior y lo transforma ('sí, y...').",
        "- status: jerarquía/posición clara en conducta o lenguaje.",
        "- ending: cierre con acción/decisión/imagen final, no se desinfla.",
      ].join("\n")
    : [
        "Quick rubric per skill:",
        "- clarity: action + place + who does what (no confusion).",
        "- desire: explicit want/need/stakes.",
        "- listening: responds to prior line and transforms it ('yes, and...').",
        "- status: clear hierarchy/position in behavior or language.",
        "- ending: closes with action/decision/final image, no fizzles.",
      ].join("\n");

  const outputSpec = isES
    ? `
Devuelve SOLO JSON válido (sin markdown, sin texto fuera).
Estructura EXACTA:
{
  "points": { "clarity": 0-20, "desire": 0-20, "listening": 0-20, "status": 0-20, "ending": 0-20 },
  "evidence": { "clarity": string[], "desire": string[], "listening": string[], "status": string[], "ending": string[] },

  "recommendation": "1-2 frases con el consejo principal",
  "tips": ["1-3 tips cortos"],
  "mistakes": ["1-3 fallos concretos"],
  "penalty": "si aplica, explica breve, si no, deja string vacío",
  "text": "feedback breve (2-5 frases)"
}
Reglas:
- points SIEMPRE enteros.
- evidence 1-3 items por habilidad.
- No inventes datos fuera del transcript.
`
    : `
Return ONLY valid JSON (no markdown, no extra text).
Exact structure:
{
  "points": { "clarity": 0-20, "desire": 0-20, "listening": 0-20, "status": 0-20, "ending": 0-20 },
  "evidence": { "clarity": string[], "desire": string[], "listening": string[], "status": string[], "ending": string[] },

  "recommendation": "1-2 sentences with main advice",
  "tips": ["1-3 short tips"],
  "mistakes": ["1-3 concrete mistakes"],
  "penalty": "if applicable, short, else empty string",
  "text": "brief feedback (2-5 sentences)"
}
Rules:
- points must be integers.
- evidence 1-3 items per skill.
- Do not invent details outside transcript.
`;

  return [coachLine, context, rubric, outputSpec].join("\n\n");
}

/* =========================================================
   HANDLER (SIN ROUTER)
========================================================= */

export async function evaluateHandler(req: Request, res: Response) {
  try {
    const body = req.body as EvaluateBody;

    if (!body?.messages?.length) {
      return res.status(400).json({ error: "messages[] is required" });
    }

    const provider: ProviderName =
      body.provider ?? (AI_PROVIDER as ProviderName) ?? "ollama";

    const oracleSystem = buildOracleSystemPrompt(body);

    const evalMessages: ProviderChatMessage[] = [
      { role: "system", content: oracleSystem },
      {
        role: "user",
        content:
          `TRANSCRIPT:\n${body.transcript ?? ""}\n\n` +
          `MESSAGES (JSON):\n${safeStringify(body.messages)}`,
      },
    ];

    const out =
      provider === "openai"
        ? await chatWithOpenAI({
            provider: "openai",
            model: body.model,
            mode: body.mode,
            messages: evalMessages,
            temperature: 0.2,
            sessionId: body.sessionId,
            username: body.username,
            maxOutputTokens: 700,
          })
        : await chatWithOllama({
            provider: "ollama",
            model: body.model,
            messages: evalMessages,
            temperature: 0.2,
            sessionId: body.sessionId,
            username: body.username,
            oracle: true,
          });

    const rawText = out?.message?.content ?? "";

    const parsed = safeParseOracleJson(rawText);
    const oracle = normalizeOracle(parsed);

    if (typeof oracle.penalty === "string" && !oracle.penalty.trim()) {
      delete oracle.penalty;
    }

    if (!oracle.text?.trim()) {
      oracle.text =
        body.lang === "es"
          ? "Feedback generado por el Oráculo."
          : "Oracle feedback generated.";
    }

    const score = sumPoints(oracle.points);

    return res.json({
      ...oracle,
      score,
      provider: out.provider,
      model: out.model,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

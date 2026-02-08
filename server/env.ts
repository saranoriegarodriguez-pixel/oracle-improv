// server/env.ts
import type { ProviderName } from "./types";

function num(v: unknown, fallback: number) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function bool01(v: unknown) {
  return String(v ?? "").trim() === "1";
}

/** ✅ Puerto del server */
export const PORT = num(process.env.PORT ?? 11434, 11434);

/** ✅ CORS */
export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

/** ✅ Proveedor por defecto (allowlist runtime) */
const prov = String(process.env.AI_PROVIDER ?? "ollama").trim().toLowerCase();
export const DEFAULT_PROVIDER: ProviderName =
  prov === "openai" ? "openai" : "ollama";

/** ✅ Carpeta de datos persistentes */
export const DATA_DIR = process.env.DATA_DIR ?? ".data";

/** ✅ Ollama */
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
export const OLLAMA_DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL ?? "llama3.1:8b";
export const OLLAMA_ORACLE_MODEL = process.env.OLLAMA_ORACLE_MODEL ?? "qwen2.5:14b-instruct";

/** ✅ OpenAI */
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const OPENAI_DEFAULT_MODEL = process.env.OPENAI_DEFAULT_MODEL ?? "gpt-5-mini";

/**
 * 🔒 Límites anti-gasto
 */
export const MAX_SESSIONS_PER_DAY = num(process.env.MAX_SESSIONS_PER_DAY ?? 8, 8);
export const SESSION_DURATION_MINUTES = num(process.env.SESSION_DURATION_MINUTES ?? 8, 8);
export const MAX_MESSAGES_PER_SESSION = num(process.env.MAX_MESSAGES_PER_SESSION ?? 20, 20);
export const MAX_OUTPUT_TOKENS = num(process.env.MAX_OUTPUT_TOKENS ?? 800, 800);

export const MAX_TOKENS_TRAIN = num(process.env.MAX_TOKENS_TRAIN ?? 550, 550);
export const MAX_TOKENS_SCENE = num(process.env.MAX_TOKENS_SCENE ?? 750, 750);
export const MAX_TOKENS_TRIAL = num(process.env.MAX_TOKENS_TRIAL ?? 950, 950);

/** ✅ Presupuesto mensual */
export const MONTHLY_BUDGET_EUR = num(process.env.MONTHLY_BUDGET_EUR ?? 15, 15);
export const MONTHLY_CUTOFF_EUR = num(process.env.MONTHLY_CUTOFF_EUR ?? 14.5, 14.5);
export const USD_PER_EUR = num(process.env.USD_PER_EUR ?? 1.0, 1.0);

/** ✅ Rate limit básico (anti-spam) */
export const RATE_LIMIT_WINDOW_SEC = num(process.env.RATE_LIMIT_WINDOW_SEC ?? 20, 20);
export const RATE_LIMIT_MAX_REQ = num(process.env.RATE_LIMIT_MAX_REQ ?? 30, 30);

/** ✅ Debug: devolver raw solo si está activado */
export const DEBUG_RAW = bool01(process.env.DEBUG_RAW);
/** Google OAuth */
export const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ?? "";

export const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET ?? "";

export const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ?? "";

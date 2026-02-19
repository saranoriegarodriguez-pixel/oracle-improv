// server/env.ts

function num(value: string | undefined, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function str(value: string | undefined, fallback = ""): string {
  const s = String(value ?? "").trim();
  return s || fallback;
}

// ===============================
// Server
// ===============================
export const PORT = str(process.env.PORT, "3000");

// ⚠️ En producción NO uses "*" si vas con cookies.
export const CORS_ORIGIN = str(process.env.CORS_ORIGIN, "http://localhost:5173");

// ✅ Origen del frontend (donde vive tu web/app)
export const APP_ORIGIN = str(process.env.APP_ORIGIN, "http://localhost:5173");

// ===============================
// AI / Providers
// ===============================
const rawProvider = str(process.env.AI_PROVIDER, "ollama").toLowerCase();
export const AI_PROVIDER: "ollama" | "openai" =
  rawProvider === "openai" ? "openai" : "ollama";

// Ollama
export const OLLAMA_BASE_URL = str(process.env.OLLAMA_BASE_URL, "");
export const OLLAMA_DEFAULT_MODEL = str(process.env.OLLAMA_DEFAULT_MODEL, "");
export const OLLAMA_ORACLE_MODEL = str(process.env.OLLAMA_ORACLE_MODEL, "");

// OpenAI (solo si lo usas)
export const OPENAI_API_KEY = str(process.env.OPENAI_API_KEY, "");
export const OPENAI_DEFAULT_MODEL = str(process.env.OPENAI_DEFAULT_MODEL, "");
export const OPENAI_ORACLE_MODEL = str(process.env.OPENAI_ORACLE_MODEL, "");

// ===============================
// Tokens / caps
// ===============================
export const MAX_TOKENS_TRAIN = clamp(num(process.env.MAX_TOKENS_TRAIN, 900), 64, 8000);
export const MAX_TOKENS_SCENE = clamp(num(process.env.MAX_TOKENS_SCENE, 1200), 64, 12000);
export const MAX_TOKENS_TRIAL = clamp(num(process.env.MAX_TOKENS_TRIAL, 800), 64, 8000);

export const MAX_OUTPUT_TOKENS = clamp(num(process.env.MAX_OUTPUT_TOKENS, 800), 64, 4000);

// ===============================
// Usage / limits
// ===============================
export const MAX_SESSIONS_PER_DAY = clamp(num(process.env.MAX_SESSIONS_PER_DAY, 10), 1, 200);
export const SESSION_DURATION_MINUTES = clamp(num(process.env.SESSION_DURATION_MINUTES, 8), 1, 180);
export const MAX_MESSAGES_PER_SESSION = clamp(num(process.env.MAX_MESSAGES_PER_SESSION, 50), 5, 500);

// ===============================
// Rate limit
// ===============================
export const RATE_LIMIT_MAX_REQ = clamp(num(process.env.RATE_LIMIT_MAX_REQ, 120), 10, 5000);
export const RATE_LIMIT_WINDOW_SEC = clamp(num(process.env.RATE_LIMIT_WINDOW_SEC, 60), 5, 3600);

// ===============================
// Budget / storage
// ===============================
export const DATA_DIR = str(process.env.DATA_DIR, ".data");

export const MONTHLY_BUDGET_EUR = clamp(num(process.env.MONTHLY_BUDGET_EUR, 0), 0, 1_000_000);
export const MONTHLY_CUTOFF_EUR = clamp(num(process.env.MONTHLY_CUTOFF_EUR, 0), 0, 1_000_000);
export const USD_PER_EUR = clamp(num(process.env.USD_PER_EUR, 1), 0.000001, 1000);

// ===============================
// Debug
// ===============================
export const DEBUG_RAW = process.env.DEBUG_RAW === "1";

// ===============================
// Google OAuth
// ===============================
// ✅ Client ID/Secret de Google
export const GOOGLE_CLIENT_ID = str(process.env.GOOGLE_CLIENT_ID, "");
export const GOOGLE_CLIENT_SECRET = str(process.env.GOOGLE_CLIENT_SECRET, "");

// ✅ Redirect URI registrado en Google Cloud (apunta al BACKEND)
// Ejemplos:
// - Local: http://localhost:3000/auth/google/callback
// - Prod:  https://saraatelier.studio/api/auth/google/callback
export const GOOGLE_CALLBACK_URL = str(process.env.GOOGLE_CALLBACK_URL, "");

// ===============================
// Session / Cookies
// ===============================
export const SESSION_SECRET = str(process.env.SESSION_SECRET, "");

// Nombre cookie (default seguro)
export const COOKIE_NAME = str(process.env.COOKIE_NAME, "oracle_sid");

// En local: false. En prod (https): true.
export const COOKIE_SECURE = str(process.env.COOKIE_SECURE, "false") === "true";

// local: lax. prod cross-domain: none.
export const COOKIE_SAMESITE = str(process.env.COOKIE_SAMESITE, "lax") as
  | "lax"
  | "strict"
  | "none";

// opcional (útil si usas www y no-www)
export const COOKIE_DOMAIN = str(process.env.COOKIE_DOMAIN, "");
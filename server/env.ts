// server/env.ts

function num(value: string | undefined, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// ===============================
// Server
// ===============================
export const PORT = process.env.PORT || "3000";
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// ===============================
// AI / Providers
// ===============================
export const AI_PROVIDER = (process.env.AI_PROVIDER as "ollama" | "openai") || "ollama";

// Ollama
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "";
export const OLLAMA_DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || "";
export const OLLAMA_ORACLE_MODEL = process.env.OLLAMA_ORACLE_MODEL || "";

// OpenAI (solo si lo usas)
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const OPENAI_DEFAULT_MODEL = process.env.OPENAI_DEFAULT_MODEL || "";
export const OPENAI_ORACLE_MODEL = process.env.OPENAI_ORACLE_MODEL || "";

// ===============================
// Tokens / caps
// ===============================
export const MAX_TOKENS_TRAIN = num(process.env.MAX_TOKENS_TRAIN);
export const MAX_TOKENS_SCENE = num(process.env.MAX_TOKENS_SCENE);
export const MAX_TOKENS_TRIAL = num(process.env.MAX_TOKENS_TRIAL);
export const MAX_OUTPUT_TOKENS = num(process.env.MAX_OUTPUT_TOKENS);

// ===============================
// Usage / limits
// ===============================
export const MAX_SESSIONS_PER_DAY = num(process.env.MAX_SESSIONS_PER_DAY, 10);
export const SESSION_DURATION_MINUTES = num(process.env.SESSION_DURATION_MINUTES, 8);
export const MAX_MESSAGES_PER_SESSION = num(process.env.MAX_MESSAGES_PER_SESSION, 50);

// ===============================
// Rate limit
// ===============================
export const RATE_LIMIT_MAX_REQ = num(process.env.RATE_LIMIT_MAX_REQ, 120);
export const RATE_LIMIT_WINDOW_SEC = num(process.env.RATE_LIMIT_WINDOW_SEC, 60);

// ===============================
// Budget / storage
// ===============================
export const DATA_DIR = process.env.DATA_DIR || ".data";

export const MONTHLY_BUDGET_EUR = num(process.env.MONTHLY_BUDGET_EUR);
export const MONTHLY_CUTOFF_EUR = num(process.env.MONTHLY_CUTOFF_EUR);
export const USD_PER_EUR = num(process.env.USD_PER_EUR, 1);

// ===============================
// Debug
// ===============================
export const DEBUG_RAW = process.env.DEBUG_RAW === "1";

// ===============================
// Google OAuth
// ===============================
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "";
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "";

// ===============================
// Session / Cookies
// ===============================
export const SESSION_SECRET = process.env.SESSION_SECRET || "";

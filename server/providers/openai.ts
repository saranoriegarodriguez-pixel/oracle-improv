// server/providers/openai.ts
import type { ChatRequest, ChatResponse } from "../types.js";
import {
  OPENAI_API_KEY,
  OPENAI_DEFAULT_MODEL,
  MAX_OUTPUT_TOKENS,
  MAX_TOKENS_TRAIN,
  MAX_TOKENS_SCENE,
  MAX_TOKENS_TRIAL,
  DEBUG_RAW,
} from "../env.js";

import { addUsdSpend } from "../store/budgetStore.js";

const ALLOWED_OPENAI_MODELS = new Set(["gpt-5-mini"]);

function pickModel(req: ChatRequest): string {
  const requested = String(req.model ?? OPENAI_DEFAULT_MODEL).trim();
  return ALLOWED_OPENAI_MODELS.has(requested) ? requested : OPENAI_DEFAULT_MODEL;
}

function clampInt(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function pickMaxTokens(req: ChatRequest): number {
  if (typeof req.maxOutputTokens === "number") return req.maxOutputTokens;

  if (req.mode === "train") return MAX_TOKENS_TRAIN;
  if (req.mode === "scene") return MAX_TOKENS_SCENE;
  if (req.mode === "trial") return MAX_TOKENS_TRIAL;

  return MAX_OUTPUT_TOKENS;
}

// Precios GPT-5 mini (USD por 1M tokens)
const USD_IN_PER_1M = 0.25;
const USD_OUT_PER_1M = 2.0;

function costUsd(promptTokens: number, completionTokens: number) {
  return (promptTokens / 1_000_000) * USD_IN_PER_1M +
         (completionTokens / 1_000_000) * USD_OUT_PER_1M;
}

function ownerKeyFromReq(req: ChatRequest) {
  const u = typeof req.username === "string" ? req.username.trim().toLowerCase() : "";
  return u ? `user:${u}` : "ip:unknown";
}

export async function chatWithOpenAI(req: ChatRequest): Promise<ChatResponse> {
  const model = pickModel(req);

  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY (ponlo en tu .env)");
  }

  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: OPENAI_API_KEY });

  const max_tokens = clampInt(pickMaxTokens(req), 64, 2000);

  const completion = await client.chat.completions.create({
    model,
    messages: req.messages,
    temperature: typeof req.temperature === "number" ? req.temperature : 0.7,
    max_tokens,
  });

  // ✅ Budget mensual: sumar coste real por tokens
  const usage: any = (completion as any).usage ?? {};
  const promptTokens = Number(usage.prompt_tokens ?? 0);
  const completionTokens = Number(usage.completion_tokens ?? 0);
  addUsdSpend(ownerKeyFromReq(req), costUsd(promptTokens, completionTokens));

  const content = completion.choices?.[0]?.message?.content ?? "";

  const out: ChatResponse = {
    provider: "openai",
    model,
    message: { role: "assistant", content },
  };

  // ✅ raw solo en debug
  if (DEBUG_RAW) out.raw = completion;

  return out;
}

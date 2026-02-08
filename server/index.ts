// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";

import { PORT, CORS_ORIGIN, DEFAULT_PROVIDER } from "./env";
import type { ChatRequest, ProviderName } from "./types";

import { chatWithOllama } from "./providers/ollama";
import { chatWithOpenAI } from "./providers/openai";

import { characterPromptRoute } from "./characterPrompt";
import { evaluateRouter } from "./evaluate";
import { usageRouter } from "./usage";
import { budgetRouter } from "./budget";

import { enforceSessionLimits } from "./middleware/limits";
import { enforceMonthlyBudget } from "./middleware/budget";
import { rateLimitAI } from "./middleware/rateLimit";

// ✅ Google OAuth
import { googleAuthRouter } from "./routes/googleAuth";

const app = express();

// ✅ importante si estás detrás de proxy (Render/Fly/Nginx)
app.set("trust proxy", 1);

/* -------- CORS -------- */
app.use(
  cors({
    origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN,
  })
);

app.use(express.json({ limit: "2mb" }));

/* -------- HEALTH -------- */
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    provider: DEFAULT_PROVIDER,
  });
});

/* -------- Google OAuth -------- */
app.use("/auth", googleAuthRouter);

/* -------- Middlewares IA -------- */
const limitsMw = enforceSessionLimits({ requireSessionId: true });
const budgetMw = enforceMonthlyBudget();
const rateMw = rateLimitAI();

function requireUsernameForOpenAI(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const u =
    typeof (req.body as any)?.username === "string"
      ? String((req.body as any).username).trim()
      : "";
  if (!u) {
    return res.status(400).json({
      error:
        "Missing username. Required when provider=openai for budget/limits tracking.",
    });
  }
  return next();
}

function applyOpenAIMiddlewares(req: Request, res: Response, next: NextFunction) {
  // rate -> username -> budget -> limits
  (rateMw as any)(req, res, (err?: any) => {
    if (err) return next(err);

    requireUsernameForOpenAI(req, res, () => {
      (budgetMw as any)(req, res, (err2?: any) => {
        if (err2) return next(err2);
        return (limitsMw as any)(req, res, next);
      });
    });
  });
}

/* -------- ✅ LIMITS + BUDGET + RATE también en /api/evaluate (solo OpenAI) -------- */
app.use("/api/evaluate", (req, res, next) => {
  const provider = (((req.body as any)?.provider ?? DEFAULT_PROVIDER) as ProviderName);
  if (provider !== "openai") return next();
  return applyOpenAIMiddlewares(req, res, next);
});

/* -------- CHAT -------- */
app.post(
  "/api/chat",
  (req, res, next) => {
    const provider = (((req.body as any)?.provider ?? DEFAULT_PROVIDER) as ProviderName);
    if (provider === "openai") return applyOpenAIMiddlewares(req, res, next);
    return next();
  },
  async (req, res) => {
    try {
      const body = req.body as ChatRequest;

      if (!body?.messages?.length) {
        return res.status(400).json({ error: "messages[] is required" });
      }

      const provider = (body.provider ?? DEFAULT_PROVIDER) as ProviderName;

      const out =
        provider === "openai"
          ? await chatWithOpenAI(body)
          : await chatWithOllama(body);

      return res.json(out);
    } catch (err: any) {
      console.error("❌ /api/chat error:", err);
      return res.status(500).json({ error: err?.message ?? "Unknown server error" });
    }
  }
);

/* -------- CHARACTER PROMPT -------- */
app.post("/api/characterPrompt", characterPromptRoute);

/* -------- EVALUATE -------- */
app.use("/api", evaluateRouter);

/* -------- USAGE -------- */
app.use("/api", usageRouter);

/* -------- BUDGET -------- */
app.use("/api", budgetRouter);

/* -------- START -------- */
app.listen(PORT, () => {
  console.log(`🟢 AI server listening on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Chat:   http://localhost:${PORT}/api/chat`);
  console.log(`Char:   http://localhost:${PORT}/api/characterPrompt`);
  console.log(`Eval:   http://localhost:${PORT}/api/evaluate`);
  console.log(`Usage:  http://localhost:${PORT}/api/usage/:username`);
  console.log(`Budget: http://localhost:${PORT}/api/budget/:username`);

  // ✅ Google OAuth
  console.log(`OAuth:  http://localhost:${PORT}/auth/google`);
  console.log(`CB:     http://localhost:${PORT}/auth/callback/google`);
});

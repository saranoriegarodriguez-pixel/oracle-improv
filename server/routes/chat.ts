// server/routes/chat.ts
import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import type { ChatRequest, ProviderName } from "../types.js";
import { AI_PROVIDER } from "../env.js";

import { chatWithOllama } from "../providers/ollama.js";
import { chatWithOpenAI } from "../providers/openai.js";

// ✅ sesión Google
import { getSessionUser } from "../auth/sessions.js";

export const chatRouter = Router();

/**
 * Middleware: si hay sesión, fija username=email para:
 * - limits.ts (8 sesiones/día) ✅
 * - budgetStore (10-15€/mes) ✅
 * Y bloquea OpenAI si no hay sesión.
 */
function attachAuthToBody(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as any;

  const user = getSessionUser(req);
  const email = user?.email ? String(user.email).trim().toLowerCase() : "";

  // ✅ si hay sesión: el backend manda (no falsificable)
  if (email) {
    body.username = email;
  }

  // ✅ si piden OpenAI sin sesión: 401
  const requestedProvider = String(body.provider ?? "").trim().toLowerCase();
  if (requestedProvider === "openai" && !email) {
    return res.status(401).json({
      ok: false,
      code: "AUTH_REQUIRED",
      message: "OpenAI requires Google login.",
    });
  }

  // ✅ provider por defecto lo decide el backend
  if (!requestedProvider) {
    body.provider = (AI_PROVIDER || "ollama") as ProviderName;
  }

  (req as any).body = body;
  return next();
}

/**
 * POST /api/chat
 */
chatRouter.post("/chat", attachAuthToBody, async (req: Request, res: Response) => {
  try {
    const body = req.body as ChatRequest;

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return res.status(400).json({ error: "messages[] is required" });
    }

    const provider = String(body.provider ?? AI_PROVIDER ?? "ollama").toLowerCase() as ProviderName;

    const out =
      provider === "openai"
        ? await chatWithOpenAI({ ...body, provider: "openai" })
        : await chatWithOllama({ ...body, provider: "ollama" });

    return res.json(out);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

import { Router } from "express";
import type { Request, Response } from "express";
import crypto from "crypto";

import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  APP_ORIGIN,
} from "../env.js";

import {
  createSession,
  getSessionUser,
  clearSession,
  type SessionUser,
} from "../auth/sessions.js";
export const googleAuthRouter = Router();

/**
 * CSRF state store + next
 */
const stateStore = new Map<string, { ts: number; next: string }>();
const STATE_TTL_MS = 10 * 60 * 1000;

function cleanupStateStore() {
  const now = Date.now();
  for (const [k, v] of stateStore.entries()) {
    if (now - v.ts > STATE_TTL_MS) stateStore.delete(k);
  }
}

function consumeState(state: string): string | null {
  const v = stateStore.get(state);
  if (!v) return null;

  if (Date.now() - v.ts > STATE_TTL_MS) {
    stateStore.delete(state);
    return null;
  }

  stateStore.delete(state);
  return v.next || null;
}

function safeNext(rawNext: string): string {
  // default a la app
  const fallback = `${APP_ORIGIN}/app`;
  const s = String(rawNext ?? "").trim();
  if (!s) return fallback;

  // Si es relativa, la convertimos a absoluta en APP_ORIGIN
  if (s.startsWith("/")) return `${APP_ORIGIN}${s}`;

  // Si es absoluta, solo aceptamos si empieza por APP_ORIGIN
  if (s.startsWith("http://") || s.startsWith("https://")) {
    if (s.startsWith(APP_ORIGIN)) return s;
    return fallback;
  }

  // Cualquier otra cosa rara, fallback
  return fallback;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init);
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Fetch failed ${r.status}: ${txt || r.statusText}`);
  }
  return (await r.json()) as T;
}

/**
 * GET /api/auth/google/start
 */
googleAuthRouter.get("/auth/google/start", (req: Request, res: Response) => {
  cleanupStateStore();

  const next = safeNext(String(req.query.next ?? ""));
  const state = crypto.randomBytes(16).toString("hex");
  stateStore.set(state, { ts: Date.now(), next });

  if (!GOOGLE_CLIENT_ID) return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID" });
  if (!GOOGLE_CALLBACK_URL) return res.status(500).json({ error: "Missing GOOGLE_CALLBACK_URL" });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return res.json({ url });
});

/**
 * GET /api/auth/google/callback
 */
googleAuthRouter.get("/auth/google/callback", async (req: Request, res: Response) => {
  try {
    const code = String(req.query.code ?? "");
    const state = String(req.query.state ?? "");
    if (!code) return res.status(400).send("Missing code");
    if (!state) return res.status(400).send("Missing state");

    const next = consumeState(state);
    if (!next) return res.status(400).send("Invalid/expired state");

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
      return res.status(500).send("Missing Google OAuth env vars");
    }

    // code -> token
    const tokenRes = await fetchJson<{
      access_token: string;
      expires_in?: number;
      refresh_token?: string;
      id_token?: string;
      token_type?: string;
      scope?: string;
    }>("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }).toString(),
    });

    // token -> userinfo
    const userInfo = await fetchJson<SessionUser>(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokenRes.access_token}` } }
    );

    // create cookie session
    createSession(res, userInfo);

    // redirect to frontend
    return res.redirect(next);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).send(message);
  }
});

/**
 * GET /api/auth/me
 */
googleAuthRouter.get("/auth/me", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ ok: false });
  return res.json({ ok: true, user });
});

/**
 * POST /api/auth/logout
 */
googleAuthRouter.post("/auth/logout", (req: Request, res: Response) => {
  clearSession(req, res);
  return res.json({ ok: true });
});
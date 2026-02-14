// server/routes/googleAuth.ts
import { Router } from "express";
import type { Request, Response } from "express";
import crypto from "crypto";

import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_CALLBACK_URL,
} from "../env";

import { createSession, getSessionUser, clearSession, type SessionUser } from "../auth/sessions";

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
 * Devuelve la URL de Google para iniciar login.
 * Acepta ?next=/app/...
 */
googleAuthRouter.get("/api/auth/google/start", (req: Request, res: Response) => {
  cleanupStateStore();

  const next = String(req.query.next ?? "").trim() || GOOGLE_CALLBACK_URL || "/app";

  const state = crypto.randomBytes(16).toString("hex");
  stateStore.set(state, { ts: Date.now(), next });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url });
});

/**
 * GET /api/auth/google/callback
 * Intercambia code -> tokens -> userinfo.
 * Crea cookie de sesión y redirige a next.
 */
googleAuthRouter.get("/api/auth/google/callback", async (req: Request, res: Response) => {
  try {
    const code = String(req.query.code ?? "");
    const state = String(req.query.state ?? "");

    if (!code) return res.status(400).send("Missing code");
    if (!state) return res.status(400).send("Missing state");

    const next = consumeState(state);
    if (!next) return res.status(400).send("Invalid/expired state");

    // 1) code -> token
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
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
    });

    // 2) userinfo
    const userInfo = await fetchJson<SessionUser>("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenRes.access_token}` },
    });

    // 3) cookie session
    createSession(res, userInfo);

    // 4) redirect
    return res.redirect(next);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).send(message);
  }
});

/**
 * GET /api/auth/me
 * 200 si hay sesión, 401 si no.
 */
googleAuthRouter.get("/api/auth/me", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ ok: false });
  return res.json({ ok: true, user });
});

/**
 * POST /api/auth/logout
 * Borra sesión y cookie.
 */
googleAuthRouter.post("/api/auth/logout", (req: Request, res: Response) => {
  clearSession(req, res);
  return res.json({ ok: true });
});

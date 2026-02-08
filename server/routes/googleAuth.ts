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

export const googleAuthRouter = Router();

/**
 * CSRF state store (simple)
 */
const stateStore = new Map<string, number>();
const STATE_TTL_MS = 10 * 60 * 1000;

function cleanupStateStore() {
  const now = Date.now();
  for (const [k, ts] of stateStore.entries()) {
    if (now - ts > STATE_TTL_MS) stateStore.delete(k);
  }
}

function consumeState(state: string): boolean {
  const ts = stateStore.get(state);
  if (!ts) return false;
  if (Date.now() - ts > STATE_TTL_MS) {
    stateStore.delete(state);
    return false;
  }
  stateStore.delete(state);
  return true;
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
 * Devuelve la URL de Google para iniciar login (o redirige si prefieres).
 */
googleAuthRouter.get("/api/auth/google/start", (_req: Request, res: Response) => {
  cleanupStateStore();

  const state = crypto.randomBytes(16).toString("hex");
  stateStore.set(state, Date.now());

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
 * Intercambia code -> tokens (server side) y obtiene perfil básico
 */
googleAuthRouter.get("/api/auth/google/callback", async (req: Request, res: Response) => {
  try {
    const code = String(req.query.code ?? "");
    const state = String(req.query.state ?? "");

    if (!code) return res.status(400).json({ error: "Missing code" });
    if (!state) return res.status(400).json({ error: "Missing state" });
    if (!consumeState(state)) return res.status(400).json({ error: "Invalid/expired state" });

    // 1) Intercambiar code por tokens
    const tokenRes = await fetchJson<{
      access_token: string;
      expires_in?: number;
      refresh_token?: string;
      scope?: string;
      token_type?: string;
      id_token?: string;
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

    // 2) Perfil básico (userinfo)
    const userInfo = await fetchJson<{
      id?: string;
      email?: string;
      verified_email?: boolean;
      name?: string;
      given_name?: string;
      family_name?: string;
      picture?: string;
      locale?: string;
    }>("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenRes.access_token}` },
    });

    // 3) Redirigir al front o devolver JSON
    // Si quieres redirigir al front con query params:
    // const url = new URL(GOOGLE_CALLBACK_URL);
    // url.searchParams.set("email", userInfo.email ?? "");
    // return res.redirect(url.toString());

    return res.json({
      ok: true,
      tokens: {
        access_token: tokenRes.access_token,
        refresh_token: tokenRes.refresh_token,
        id_token: tokenRes.id_token,
        expires_in: tokenRes.expires_in,
      },
      user: userInfo,
      callbackUrl: GOOGLE_CALLBACK_URL,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

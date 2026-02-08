// server/routes/googleAuth.ts
import type { Request, Response } from "express";
import { Router } from "express";
import crypto from "crypto";
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from "../env";

export const googleAuthRouter = Router();

// Guardamos "state" en memoria para evitar CSRF (mínimo viable)
const stateStore = new Map<string, number>();
const STATE_TTL_MS = 10 * 60 * 1000; // 10 min

function cleanupStateStore() {
  const now = Date.now();
  for (const [k, ts] of stateStore.entries()) {
    if (now - ts > STATE_TTL_MS) stateStore.delete(k);
  }
}

googleAuthRouter.get("/auth/google", (req: Request, res: Response) => {
  cleanupStateStore();

  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).send("Missing GOOGLE_CLIENT_ID");
  }
  if (!GOOGLE_REDIRECT_URI) {
    return res.status(500).send("Missing GOOGLE_REDIRECT_URI");
  }

  const state = crypto.randomBytes(24).toString("hex");
  stateStore.set(state, Date.now());

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: [
      "openid",
      "email",
      "profile",
    ].join(" "),
    state,
    access_type: "offline", // te da refresh_token cuando aplique
    prompt: "consent",      // fuerza consentimiento la 1ª vez (útil en dev)
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return res.redirect(authUrl);
});

// (Opcional) exporta esto si lo quieres usar luego en el token exchange
export function consumeState(state: string) {
  const ts = stateStore.get(state);
  if (!ts) return false;
  if (Date.now() - ts > STATE_TTL_MS) {
    stateStore.delete(state);
    return false;
  }
  stateStore.delete(state);
  return true;
}

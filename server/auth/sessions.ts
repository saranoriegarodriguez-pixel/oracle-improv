// server/auth/sessions.ts
import type { Request, Response } from "express";
import crypto from "crypto";
import {
  SESSION_SECRET,
  COOKIE_NAME,
  COOKIE_SECURE,
  COOKIE_SAMESITE,
  COOKIE_DOMAIN,
} from "../env";

/**
 * Sessions in memory (MVP)
 * sid -> { user, createdAt }
 */
export type SessionUser = {
  email?: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
};

const sessions = new Map<string, { user: SessionUser; createdAt: number }>();
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function cleanupSessions() {
  const now = Date.now();
  for (const [sid, v] of sessions.entries()) {
    if (now - v.createdAt > SESSION_TTL_MS) sessions.delete(sid);
  }
}

function secret() {
  // En prod: pon SESSION_SECRET sí o sí (larga y aleatoria)
  return SESSION_SECRET || "dev-secret-change-me";
}

function signSid(sid: string) {
  return crypto.createHmac("sha256", secret()).update(sid).digest("hex");
}

function parseSignedCookie(raw: string | undefined | null): string | null {
  const v = String(raw ?? "");
  if (!v) return null;

  // format: sid.signature
  const [sid, sig] = v.split(".");
  if (!sid || !sig) return null;

  const expected = signSid(sid);
  if (sig !== expected) return null;

  return sid;
}

function cookieOpts() {
  const base: any = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
    path: "/",
    maxAge: SESSION_TTL_MS,
  };

  // Domain solo si lo configuras (normalmente solo prod)
  if (COOKIE_DOMAIN) base.domain = COOKIE_DOMAIN;

  return base;
}

/** Crear sesión y set-cookie */
export function createSession(res: Response, user: SessionUser) {
  cleanupSessions();

  const sid = crypto.randomBytes(24).toString("hex");
  sessions.set(sid, { user, createdAt: Date.now() });

  const signed = `${sid}.${signSid(sid)}`;
  res.cookie(COOKIE_NAME, signed, cookieOpts());
}

/** Leer usuario desde cookie; devuelve null si no hay sesión válida */
export function getSessionUser(req: Request): SessionUser | null {
  cleanupSessions();

  const raw = (req as any).cookies?.[COOKIE_NAME] as string | undefined;
  const sid = parseSignedCookie(raw);
  if (!sid) return null;

  const s = sessions.get(sid);
  if (!s) return null;

  return s.user ?? null;
}

/** Logout (borra cookie + sesión) */
export function clearSession(req: Request, res: Response) {
  const raw = (req as any).cookies?.[COOKIE_NAME] as string | undefined;
  const sid = parseSignedCookie(raw);
  if (sid) sessions.delete(sid);

  // Para borrar bien, hay que usar las mismas opciones relevantes (path/domain)
  const opts: any = { path: "/" };
  if (COOKIE_DOMAIN) opts.domain = COOKIE_DOMAIN;

  res.clearCookie(COOKIE_NAME, opts);
}

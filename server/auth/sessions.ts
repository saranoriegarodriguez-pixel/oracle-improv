// server/auth/sessions.ts
import type { Request, Response } from "express";
import { createHmac, randomBytes } from "crypto";
import { SESSION_SECRET as ENV_SESSION_SECRET } from "../env.ts";

export type SessionUser = {
  email?: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
};

type SessionRow = {
  user: SessionUser;
  createdAt: number;
};

const sessions = new Map<string, SessionRow>();

// 7 días
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Lee config desde env */
function cookieName() {
  return process.env.COOKIE_NAME || "oracle_sid";
}

function cookieSameSite(): "lax" | "strict" | "none" {
  const v = String(process.env.COOKIE_SAMESITE || "lax").toLowerCase();
  if (v === "strict" || v === "none" || v === "lax") return v;
  return "lax";
}

function cookieSecure(): boolean {
  const raw = process.env.COOKIE_SECURE;
  if (raw != null) return String(raw).toLowerCase() === "true";
  return isProd();
}

function cookieDomain(): string | undefined {
  const d = String(process.env.COOKIE_DOMAIN || "").trim();
  return d ? d : undefined;
}

function isProd() {
  return process.env.NODE_ENV === "production";
}

function cleanupSessions() {
  const now = Date.now();
  for (const [sid, v] of sessions.entries()) {
    if (now - v.createdAt > SESSION_TTL_MS) sessions.delete(sid);
  }
}

function secret() {
  return (
    ENV_SESSION_SECRET ||
    process.env.SESSION_SECRET ||
    "dev-secret-change-me"
  );
}

function signSid(sid: string) {
  return createHmac("sha256", secret()).update(sid).digest("hex");
}

/** formato: sid.signature */
function parseSignedCookie(raw: string | undefined | null): string | null {
  const v = String(raw ?? "");
  if (!v) return null;

  const [sid, sig] = v.split(".");
  if (!sid || !sig) return null;

  const expected = signSid(sid);
  if (sig !== expected) return null;

  return sid;
}

/** Crear sesión y set-cookie */
export function createSession(res: Response, user: SessionUser): void {
  cleanupSessions();

  const sid = randomBytes(24).toString("hex");
  sessions.set(sid, { user, createdAt: Date.now() });

  const signed = `${sid}.${signSid(sid)}`;

  res.cookie(cookieName(), signed, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: cookieSameSite(),
    path: "/",
    domain: cookieDomain(),
    maxAge: SESSION_TTL_MS,
  });
}

/** Leer usuario desde cookie; devuelve null si no hay sesión válida */
export function getSessionUser(req: Request): SessionUser | null {
  cleanupSessions();

  const cookies = (req as any).cookies as Record<string, string> | undefined;

  const raw = cookies?.[cookieName()];
  const sid = parseSignedCookie(raw);

  if (!sid) return null;

  const s = sessions.get(sid);
  return s?.user ?? null;
}

/** Logout (borra cookie + sesión) */
export function clearSession(req: Request, res: Response): void {
  const cookies = (req as any).cookies as Record<string, string> | undefined;

  const raw = cookies?.[cookieName()];
  const sid = parseSignedCookie(raw);

  if (sid) sessions.delete(sid);

  res.clearCookie(cookieName(), {
    path: "/",
    domain: cookieDomain(),
    secure: cookieSecure(),
    sameSite: cookieSameSite(),
  });
}

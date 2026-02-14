// src/utils/identity.ts
import type { AuthUser } from "../state/authTypes";

export type Identity = {
  // visible en UI
  displayName: string;

  // para backend (usage/limits/budget). Si hay Google, email.
  ownerUsername: string;

  // email normalizado si existe
  email: string;

  // flags
  isAuthed: boolean;
};

export function normalizeEmail(u: AuthUser | null | undefined): string {
  const e = u?.email ? String(u.email).trim().toLowerCase() : "";
  return e;
}

/**
 * SOURCE OF TRUTH:
 * - displayName: alias local (perfil)
 * - ownerUsername: email si existe, si no alias
 */
export function computeIdentity(opts: {
  authStatus: "unknown" | "loading" | "authed" | "anon";
  user: AuthUser | null;
  displayName: string;
}): Identity {
  const email = normalizeEmail(opts.user);
  const isAuthed = opts.authStatus === "authed" && !!email;

  const displayName = (opts.displayName || "").trim() || "Sin nombre";
  const ownerUsername = email || displayName;

  return { displayName, ownerUsername, email, isAuthed };
}

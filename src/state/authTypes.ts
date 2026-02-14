// src/state/authTypes.ts
export type AuthStatus = "unknown" | "loading" | "authed" | "anon";

export type AuthUser = {
  email?: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
};

export type AuthMeResponse =
  | { ok: true; user: AuthUser }
  | { ok: false };

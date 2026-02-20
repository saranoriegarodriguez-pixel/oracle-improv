// src/state/authStore.ts
import { create } from "zustand";
import type { AuthStatus, AuthUser, AuthMeResponse } from "./authTypes";

// ✅ Base URL del backend (Render) en prod, localhost en dev
// En Vercel: VITE_API_BASE_URL = https://oracle-improv-api.onrender.com
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  "http://localhost:3000";

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;

  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

async function fetchMe(): Promise<AuthMeResponse> {
  const r = await fetch(`${API_BASE}/api/auth/me`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!r.ok) return { ok: false };
  return (await r.json()) as AuthMeResponse;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "unknown",
  user: null,

  refresh: async () => {
    if (get().status === "loading") return;

    set({ status: "loading" });
    try {
      const data = await fetchMe();
      if (data.ok) {
        set({ status: "authed", user: data.user ?? null });
      } else {
        set({ status: "anon", user: null });
      }
    } catch {
      set({ status: "anon", user: null });
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
    } catch {
      // ignore
    } finally {
      set({ status: "anon", user: null });
    }
  },
}));
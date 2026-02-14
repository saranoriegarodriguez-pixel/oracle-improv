// src/state/authStore.ts
import { create } from "zustand";
import type { AuthStatus, AuthUser, AuthMeResponse } from "./authTypes";

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;

  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

async function fetchMe(): Promise<AuthMeResponse> {
  const r = await fetch("/api/auth/me", { credentials: "include" });
  if (!r.ok) return { ok: false };
  return (await r.json()) as AuthMeResponse;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "unknown",
  user: null,

  refresh: async () => {
    // evita llamadas duplicadas si ya estás cargando
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
      // si falla, mejor considerarlo anon (no bloquea la app)
      set({ status: "anon", user: null });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    } finally {
      set({ status: "anon", user: null });
    }
  },
}));

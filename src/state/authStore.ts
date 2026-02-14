// src/state/authStore.ts
import { create } from "zustand";

export type AuthUser = {
  email?: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
};

type AuthStatus = "unknown" | "loading" | "authed" | "guest";

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;

  // Acciones
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

async function safeJson<T>(r: Response): Promise<T | null> {
  try {
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "unknown",
  user: null,

  refresh: async () => {
    const cur = get().status;
    if (cur === "loading") return;

    set({ status: "loading" });

    try {
      const r = await fetch("/api/auth/me", { credentials: "include" });
      if (!r.ok) {
        set({ status: "guest", user: null });
        return;
      }

      const data = await safeJson<{ ok: boolean; user?: AuthUser }>(r);
      if (data?.ok) {
        set({ status: "authed", user: data.user ?? null });
      } else {
        set({ status: "guest", user: null });
      }
    } catch {
      set({ status: "guest", user: null });
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
      set({ status: "guest", user: null });
    }
  },
}));

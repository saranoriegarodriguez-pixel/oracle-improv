// src/state/feedback/toastStore.ts
import { useCallback, useMemo, useState } from "react";
import type { ToastItem, ToastTone } from "./types";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const DEFAULT_TTL = 3200;
const MAX_ITEMS = 5;

type PushInput = {
  tone: ToastTone;
  message: string;
  title?: string;
  ttlMs?: number;
};

type HelperOpts = {
  title?: string;
  ttlMs?: number;
};

export function useToastStore() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const push = useCallback(
    (input: PushInput) => {
      const id = uid();
      const ttlMs = input.ttlMs ?? DEFAULT_TTL;

      const toast: ToastItem = {
        id,
        tone: input.tone,
        title: input.title,
        message: input.message,
        ttlMs,
        createdAt: Date.now(),
      };

      setItems((prev) => [toast, ...prev].slice(0, MAX_ITEMS));

      if (ttlMs > 0) {
        window.setTimeout(() => dismiss(id), ttlMs);
      }

      return id;
    },
    [dismiss]
  );

  // helpers
  const api = useMemo(() => {
    return {
      items,
      dismiss,
      clear,
      push,

      success: (message: string, opts: HelperOpts = {}) => push({ tone: "success", message, ...opts }),
      error: (message: string, opts: HelperOpts = {}) => push({ tone: "error", message, ...opts }),
      info: (message: string, opts: HelperOpts = {}) => push({ tone: "info", message, ...opts }),
      warning: (message: string, opts: HelperOpts = {}) => push({ tone: "warning", message, ...opts }),

      // ✅ nombre seguro: NO colisiona con ctx.oracle
      oracleToast: (message: string, opts: HelperOpts = {}) => push({ tone: "oracle", message, ...opts }),
    };
  }, [items, dismiss, clear, push]);

  return api;
}

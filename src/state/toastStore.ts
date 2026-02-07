import { useCallback, useEffect, useRef, useState } from "react";
import type { ToastItem, ToastTone } from "../components/toast/toastTypes";
import { newToastId } from "../components/toast/toastTypes";

export function useToasts() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    const t = timers.current[id];
    if (t) window.clearTimeout(t);
    delete timers.current[id];
  }, []);

  const push = useCallback((tone: ToastTone, message: string, opts?: { title?: string; ttlMs?: number }) => {
    const id = newToastId();
    const ttl = opts?.ttlMs ?? 3200;

    const item: ToastItem = { id, tone, message, title: opts?.title, ttlMs: ttl };
    setItems((prev) => [item, ...prev].slice(0, 6));

    timers.current[id] = window.setTimeout(() => dismiss(id), ttl);
    return id;
  }, [dismiss]);

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((t) => window.clearTimeout(t));
      timers.current = {};
    };
  }, []);

  return { items, push, dismiss };
}

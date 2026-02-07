import React, { createContext, useContext } from "react";
import ToastHost from "../components/toast/ToastHost";
import { useToasts } from "./toastStore";
import type { ToastTone } from "../components/toast/toastTypes";

type ToastApi = {
  push: (tone: ToastTone, message: string, opts?: { title?: string; ttlMs?: number }) => string;
};

const ToastCtx = createContext<ToastApi | null>(null);

export function ToastProvider(props: { children: React.ReactNode }) {
  const toasts = useToasts();

  return (
    <ToastCtx.Provider value={{ push: toasts.push }}>
      {props.children}
      <ToastHost items={toasts.items} onDismiss={toasts.dismiss} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export type ToastTone = "success" | "warning" | "error" | "oracle" | "info";

export type ToastItem = {
  id: string;
  tone: ToastTone;
  title?: string;
  message: string;
  ttlMs?: number; // default 3200
};

export function newToastId() {
  return `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

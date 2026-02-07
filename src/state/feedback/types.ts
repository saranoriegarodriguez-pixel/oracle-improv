// src/state/feedback/types.ts
import type { OraclePoints } from "../../api/evaluate"; // ajusta la ruta si te falla

export type ToastTone = "success" | "error" | "info" | "warning" | "oracle";

export type ToastItem = {
  id: string;
  tone: ToastTone;
  title?: string;
  message: string;
  ttlMs?: number; // default 3200 en store
  createdAt: number;
};

export type OracleVerdict = {
  ts: number; // Date.now()
  lang?: "es" | "en"; // ✅ NUEVO: para UI ES/EN del modal

  title?: string;

  // ✅ puntuación total (0..100) y desglose por skill (0..20)
  score?: number;
  points?: OraclePoints;

  // ✅ feedback estructurado
  recommendation?: string;
  tips?: string[];
  mistakes?: string[];
  penalty?: string;

  // ✅ fallback (texto crudo del modelo)
  rawText?: string;
};

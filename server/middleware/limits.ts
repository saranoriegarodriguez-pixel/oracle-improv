// server/middleware/limits.ts
import type { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import {
  DATA_DIR,
  MAX_SESSIONS_PER_DAY,
  SESSION_DURATION_MINUTES,
  MAX_MESSAGES_PER_SESSION,
  MAX_OUTPUT_TOKENS,
} from "../env";
import { readJsonFile, writeJsonFileAtomic } from "../store/persist";
import { getOwnerKey as ownerKeyFromReq } from "../utils/ownerKey";

type SessionInfo = {
  sessionId: string;
  ownerKey: string; // user:xxx o ip:xxx
  startedAtMs: number;
  lastSeenMs: number;
  messageCount: number;
};

type DayInfo = {
  dayKey: string; // YYYY-MM-DD
  sessionsCreatedByOwner: Record<string, number>;
  sessions: Record<string, SessionInfo>; // key: ownerKey::sessionId
};

type PersistShape = {
  current?: DayInfo;
};

// ✅ Vercel solo permite escribir en /tmp
function safeDataDir(): string {
  const dir = String(DATA_DIR ?? "").trim();
  if (!dir) return "/tmp/oracle-data";
  if (dir === ".data" || dir.startsWith("./") || dir.startsWith("../")) {
    return "/tmp/oracle-data";
  }
  return dir;
}

function ensureDir(dir: string) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e: any) {
    // No tiramos: en serverless degradamos a memoria
    console.error("limits.ensureDir failed:", e?.message ?? e);
  }
}

const DIR = safeDataDir();
ensureDir(DIR);
const FILE = path.join(DIR, "limits.json");

// ✅ Store en memoria siempre existe
let store: PersistShape = {};

// ✅ Intentamos cargar desde disco, pero si falla no crasheamos
try {
  store = readJsonFile(FILE, {});
} catch (e: any) {
  console.error("limits.readJsonFile failed:", e?.message ?? e);
  store = {};
}

function save() {
  try {
    writeJsonFileAtomic(FILE, store);
  } catch (e: any) {
    // En Vercel si por lo que sea no puede escribir, seguimos en RAM
    console.error("limits.writeJsonFileAtomic failed:", e?.message ?? e);
  }
}

function getDayKey(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function ensureDayStore(): DayInfo {
  const dayKey = getDayKey();
  if (!store.current || store.current.dayKey !== dayKey) {
    store.current = { dayKey, sessionsCreatedByOwner: {}, sessions: {} };
    save();
  }
  return store.current;
}

function minutesToMs(m: number) {
  return Math.max(1, m) * 60_000;
}

function clampInt(n: unknown, fallback: number, min: number, max: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(x)));
}

function getSessionId(req: Request) {
  const body = (req.body ?? {}) as any;
  const sid = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  return sid || "";
}

/** ✅ USAGE para la UI */
export function getUsageForUser(username: string): number {
  const day = ensureDayStore();
  const key = `user:${(username ?? "").trim().toLowerCase()}`;
  return day.sessionsCreatedByOwner[key] ?? 0;
}

/** Limpieza simple: borra sesiones expiradas */
function gcExpired(day: DayInfo) {
  const now = Date.now();
  const durationMs = minutesToMs(SESSION_DURATION_MINUTES);
  let changed = false;

  for (const k of Object.keys(day.sessions)) {
    const s = day.sessions[k];
    if (!s) continue;
    if (now - s.startedAtMs > durationMs) {
      delete day.sessions[k];
      changed = true;
    }
  }

  if (changed) save();
}

export function enforceSessionLimits(opts?: { requireSessionId?: boolean }) {
  const requireSessionId = opts?.requireSessionId ?? true;

  return function limits(req: Request, res: Response, next: NextFunction) {
    try {
      const day = ensureDayStore();
      gcExpired(day);

      const ownerKey = ownerKeyFromReq(req);
      const sessionId = getSessionId(req);
      const sessionKey = `${ownerKey}::${sessionId}`;

      if (requireSessionId && !sessionId) {
        return res.status(400).json({
          error: "Missing sessionId. Send a unique sessionId per 8-min session.",
        });
      }

      // tokens cap (para providers)
      const body = (req.body ?? {}) as any;
      const requestedMax = body.maxOutputTokens;
      const maxOutputTokens = clampInt(requestedMax, MAX_OUTPUT_TOKENS, 64, 2000);
      body.maxOutputTokens = maxOutputTokens;
      (req as any).body = body;

      if (!sessionId) return next();

      const now = Date.now();
      const durationMs = minutesToMs(SESSION_DURATION_MINUTES);

      let s = day.sessions[sessionKey];

      // ✅ Sesión nueva => cuenta para el límite diario por owner
      if (!s) {
        const used = day.sessionsCreatedByOwner[ownerKey] ?? 0;
        if (used >= MAX_SESSIONS_PER_DAY) {
          return res.status(429).json({
            error: `Daily session limit reached (${MAX_SESSIONS_PER_DAY}). Try tomorrow.`,
            day: day.dayKey,
          });
        }

        s = {
          sessionId,
          ownerKey,
          startedAtMs: now,
          lastSeenMs: now,
          messageCount: 0,
        };

        day.sessions[sessionKey] = s;
        day.sessionsCreatedByOwner[ownerKey] = used + 1;
        save();
      } else {
        s.lastSeenMs = now;
        day.sessions[sessionKey] = s;
        save();
      }

      // expiración por duración
      const age = now - s.startedAtMs;
      if (age > durationMs) {
        return res.status(440).json({
          error: `Session expired after ${SESSION_DURATION_MINUTES} minutes. Start a new session.`,
          sessionId,
        });
      }

      // conteo de mensajes por sesión (1 request = +1)
      s.messageCount += 1;
      day.sessions[sessionKey] = s;
      save();

      if (s.messageCount > MAX_MESSAGES_PER_SESSION) {
        return res.status(429).json({
          error: `Max messages per session reached (${MAX_MESSAGES_PER_SESSION}). Start a new session.`,
          sessionId,
          debug: { countedRequests: s.messageCount },
        });
      }

      return next();
    } catch (err: any) {
      return res.status(500).json({ error: err?.message ?? "limits middleware error" });
    }
  };
}
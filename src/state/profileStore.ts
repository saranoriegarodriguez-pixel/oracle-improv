// src/state/profileStore.ts
import type { SkillKey } from "../../shared/types";

/**
 * Keys (localStorage)
 * - Puntos por skill (0..20)
 * - Usos por personaje (para Home "Para ti")
 * - Username
 */
const LS_USERNAME = "oracle.profile.username.v1";
const LS_POINTS = "oracle.profile.points.v1";
const LS_USES = "oracle.profile.characterUses.v1";

export type SkillPoints = Record<SkillKey, number>;
export type CharacterUses = Record<string, number>;

const DEFAULT_POINTS: SkillPoints = {
  clarity: 0,
  desire: 0,
  listening: 0,
  status: 0,
  ending: 0,
};

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/* -------------------------
   Username
------------------------- */

export function loadUsername(): string {
  const raw = safeJsonParse<{ username?: string }>(localStorage.getItem(LS_USERNAME), {});
  const u = (raw.username ?? "").trim();
  return u;
}

export function saveUsername(username: string): string {
  const clean = (username ?? "").trim().slice(0, 40);
  try {
    localStorage.setItem(LS_USERNAME, JSON.stringify({ username: clean }));
  } catch {
    // ignore
  }
  return clean;
}

/* -------------------------
   Points (0..20)
------------------------- */

export function loadPoints(): SkillPoints {
  const raw = safeJsonParse<Partial<SkillPoints>>(localStorage.getItem(LS_POINTS), {});
  return {
    clarity: clamp(Number(raw.clarity ?? 0), 0, 20),
    desire: clamp(Number(raw.desire ?? 0), 0, 20),
    listening: clamp(Number(raw.listening ?? 0), 0, 20),
    status: clamp(Number(raw.status ?? 0), 0, 20),
    ending: clamp(Number(raw.ending ?? 0), 0, 20),
  };
}

export function savePoints(points: SkillPoints) {
  const next: SkillPoints = {
    clarity: clamp(Number(points.clarity ?? 0), 0, 20),
    desire: clamp(Number(points.desire ?? 0), 0, 20),
    listening: clamp(Number(points.listening ?? 0), 0, 20),
    status: clamp(Number(points.status ?? 0), 0, 20),
    ending: clamp(Number(points.ending ?? 0), 0, 20),
  };

  try {
    localStorage.setItem(LS_POINTS, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function resetPoints() {
  savePoints(DEFAULT_POINTS);
}

/** ✅ NUEVO: Reset SOLO habilidades (barras). NO toca username ni usos */
export function resetSkillPoints() {
  resetPoints();
}

/** 0..20 -> 0..100 */
export function pointsToPercent(points0to20: number): number {
  const p = clamp(Number(points0to20 ?? 0), 0, 20);
  return Math.round((p / 20) * 100);
}

/* -------------------------
   Character uses
------------------------- */

export function loadCharacterUses(): CharacterUses {
  const raw = safeJsonParse<CharacterUses>(localStorage.getItem(LS_USES), {});
  // sanea: solo números >=0
  const out: CharacterUses = {};
  for (const [k, v] of Object.entries(raw)) {
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) out[k] = Math.floor(n);
  }
  return out;
}

export function getCharacterUseCount(charSlug: string): number {
  const uses = loadCharacterUses();
  return uses[charSlug] ?? 0;
}

export function bumpCharacterUse(charSlug: string, delta = 1) {
  const uses = loadCharacterUses();
  const cur = uses[charSlug] ?? 0;
  uses[charSlug] = Math.max(0, cur + Math.max(1, Math.floor(delta)));
  try {
    localStorage.setItem(LS_USES, JSON.stringify(uses));
  } catch {
    // ignore
  }
}

export function resetCharacterUses() {
  try {
    localStorage.setItem(LS_USES, JSON.stringify({}));
  } catch {
    // ignore
  }
}

/* -------------------------
   Apply Oracle points
------------------------- */

export function applyOraclePoints(args: {
  points: Partial<Record<SkillKey, number>>;
  charSlug?: string;
  allowPoints?: boolean;
}) {
  const { points, charSlug, allowPoints = true } = args;

  if (allowPoints) {
    const cur = loadPoints();
    const next: SkillPoints = {
      clarity: clamp(Number(points.clarity ?? cur.clarity), 0, 20),
      desire: clamp(Number(points.desire ?? cur.desire), 0, 20),
      listening: clamp(Number(points.listening ?? cur.listening), 0, 20),
      status: clamp(Number(points.status ?? cur.status), 0, 20),
      ending: clamp(Number(points.ending ?? cur.ending), 0, 20),
    };
    savePoints(next);
  }

  // bump uso de personaje si viene
  if (charSlug) bumpCharacterUse(charSlug, 1);
}

/* -------------------------
   Legacy compatibility
   (si en algún punto usaste breakdown antiguo)
------------------------- */
export function applySessionResult(args: {
  breakdown?: Partial<Record<SkillKey, number>>;
  charSlug?: string;
}) {
  const cur = loadPoints();
  const b = args.breakdown ?? {};
  const next: SkillPoints = {
    clarity: clamp(Number(b.clarity ?? cur.clarity), 0, 20),
    desire: clamp(Number(b.desire ?? cur.desire), 0, 20),
    listening: clamp(Number(b.listening ?? cur.listening), 0, 20),
    status: clamp(Number(b.status ?? cur.status), 0, 20),
    ending: clamp(Number(b.ending ?? cur.ending), 0, 20),
  };
  savePoints(next);
  if (args.charSlug) bumpCharacterUse(args.charSlug, 1);
}

/* -------------------------
   Reset ALL (Settings)
------------------------- */

export function resetAllProgress() {
  // borra puntos + usos + username (y lo que quiera tu “reset total”)
  try {
    localStorage.removeItem(LS_POINTS);
    localStorage.removeItem(LS_USES);
    localStorage.removeItem(LS_USERNAME);
  } catch {
    // ignore
  }
}

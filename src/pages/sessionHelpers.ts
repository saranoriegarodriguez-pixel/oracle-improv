// src/pages/sessionHelpers.ts

import { exerciseLabel, exerciseDesc } from "../../shared/data/exercises";
import type { Character } from "../../shared/types";

// -------------------------
// Tipos
// -------------------------

export type ExerciseId =
  | "E1"
  | "E2"
  | "E3"
  | "E4"
  | "E5"
  | "E6"
  | "E7"
  | "E8"
  | "E9"
  | "E10"
  | "E11"
  | "E12";

export type Lang = "es" | "en";
export type Mode = "train" | "scene" | "trial";

// -------------------------
// Validadores URL
// -------------------------

export function safeExercise(raw: string | null): ExerciseId | null {
  if (!raw) return null;
  const ok = raw.match(/^E(1|2|3|4|5|6|7|8|9|10|11|12)$/);
  return (ok ? raw : null) as ExerciseId | null;
}

export function safeMode(raw: string | null): Mode | null {
  if (raw === "train" || raw === "scene" || raw === "trial") return raw;
  return null;
}

// -------------------------
// UI helpers
// -------------------------

export function formatMMSS(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function getBgUrl(slug: string) {
  return `/characters/bg/${slug}.png`;
}

// -------------------------
// Labels
// -------------------------

export function modeLabel(mode: Mode, lang: Lang) {
  const map: Record<Mode, { es: string; en: string }> = {
    train: { es: "Entrenar", en: "Train" },
    scene: { es: "Escena", en: "Scene" },
    trial: { es: "Reto", en: "Trial" },
  };
  return map[mode][lang];
}

// -------------------------
// Prompt system (personaje) - SIN ORÁCULO
// -------------------------

function joinStyleRules(character: Character, lang: Lang) {
  const rules = character.styleRules?.[lang];
  if (!rules || !Array.isArray(rules) || rules.length === 0) return "";
  return rules.map((r) => `- ${r}`).join("\n");
}

export function buildSystemPrompt(opts: {
  character: Character;
  lang: Lang;
  mode: Mode;
  exerciseId: ExerciseId;
}) {
  const { character, lang, mode, exerciseId } = opts;

  const charName = character.name[lang];
  const modeTxt = modeLabel(mode, lang);

  const exTitle = exerciseLabel(exerciseId, lang);
  const exGoal = exerciseDesc(exerciseId, lang);

  const persona = character.prompt?.[lang]?.trim() ?? "";
  const rulesTxt = joinStyleRules(character, lang);

  if (lang === "es") {
    return [
      `Eres ${charName}.`,
      `Modo: ${modeTxt}.`,
      persona ? `PERSONA:\n${persona}` : "",
      `EJERCICIO: ${exerciseId} — ${exTitle}`,
      exGoal ? `OBJETIVO (no lo expliques): ${exGoal}` : "",
      rulesTxt ? `REGLAS DE ESTILO:\n${rulesTxt}` : "",
      `Responde SIEMPRE como ${charName}, en primera persona.`,
      `Sé breve, accionable y en personaje.`,
      `No digas que eres una IA.`,
      `No menciones "oráculo".`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `You are ${charName}.`,
    `Mode: ${modeTxt}.`,
    persona ? `PERSONA:\n${persona}` : "",
    `EXERCISE: ${exerciseId} — ${exTitle}`,
    exGoal ? `GOAL (do not explain it): ${exGoal}` : "",
    rulesTxt ? `STYLE RULES:\n${rulesTxt}` : "",
    `Always reply as ${charName}, first-person.`,
    `Be concise, actionable, and stay in character.`,
    `Don't say you're an AI.`,
    `Don't mention "oracle".`,
  ]
    .filter(Boolean)
    .join("\n");
}

// -------------------------
// Mensaje inicial (lo dice el personaje)
// -------------------------

export function buildInitialAssistantMessage(opts: {
  character: Character;
  lang: Lang;
  exerciseId: ExerciseId;
}) {
  const { character, lang, exerciseId } = opts;

  const greeting = character.greeting?.[lang]?.trim();
  if (greeting) return greeting;

  // fallback si algún personaje no trae greeting
  const exTitle = exerciseLabel(exerciseId, lang);
  return lang === "es"
    ? `Vale. Empezamos con ${exerciseId}: ${exTitle}. ¿Qué haces tú ahora?`
    : `Alright. Let's start with ${exerciseId}: ${exTitle}. What do you do now?`;
}

// -------------------------
// Header UI (arriba del chat) - SIN ORÁCULO
// -------------------------

export function buildHeaderText(opts: {
  lang: Lang;
  mode: Mode;
  exerciseId: ExerciseId;
}) {
  const { lang, mode, exerciseId } = opts;

  const modeTxt = modeLabel(mode, lang);
  const title = exerciseLabel(exerciseId, lang);
  const desc = exerciseDesc(exerciseId, lang);

  if (lang === "es") {
    return [
      `MODO: ${modeTxt}`,
      `EJERCICIO: ${exerciseId} — ${title}`,
      desc ? `OBJETIVO: ${desc}` : null,
      `(Escribe tu réplica. Sesión: 8:00)`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `MODE: ${modeTxt}`,
    `EXERCISE: ${exerciseId} — ${title}`,
    desc ? `GOAL: ${desc}` : null,
    `(Type your line. Session: 8:00)`,
  ]
    .filter(Boolean)
    .join("\n");
}

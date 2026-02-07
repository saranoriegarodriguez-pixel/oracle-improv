// shared/data/exercises.ts

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

export const EXERCISE_LABELS: Record<ExerciseId, { es: string; en: string }> = {
  E1: { es: "Quién/Dónde/Qué", en: "Who/Where/What" },
  E2: { es: "Sí, y… con acción", en: "Yes, and… with action" },
  E3: { es: "Eco (escucha)", en: "Echo (listening)" },
  E4: { es: "Status", en: "Status" },
  E5: { es: "Deseo / Muro", en: "Desire / Wall" },
  E6: { es: "Oferta única", en: "Single offer" },
  E7: { es: "Profecía inevitable", en: "Inevitable prophecy" },
  E8: { es: "Mensajero", en: "Messenger" },
  E9: { es: "Puerta / Umbral", en: "Door / Threshold" },
  E10: { es: "Coro interrumpe", en: "Chorus interrupts" },
  E11: { es: "Máscara y grieta", en: "Mask & crack" },
  E12: { es: "Eco final", en: "Final echo" },
};

export const EXERCISE_DESC: Record<ExerciseId, { es: string; en: string }> = {
  E1: {
    es:
      "Quién/Dónde/Qué: deja claro (sin narrar de más) quién eres, dónde estás y qué está pasando. Mantén esa realidad estable. No cambies el lugar ni el rol sin una razón en escena.",
    en:
      "Who/Where/What: clearly establish who you are, where you are, and what’s happening. Keep that reality stable. Don’t switch roles or location without a reason in-scene.",
  },
  E2: {
    es:
      "Sí, y… con acción: acepta lo que propone la otra persona y añade una acción concreta que lo haga avanzar. Prohibido bloquear o discutir la premisa.",
    en:
      "Yes, and… with action: accept what the other person offers and add a concrete action to move forward. No blocking or arguing the premise.",
  },
  E3: {
    es:
      "Eco (escucha): repite o refleja una palabra/idea/emoción clave del otro y construye desde ahí. Tu respuesta debe demostrar que escuchaste: ‘eco’ + avance.",
    en:
      "Echo (listening): mirror a key word/idea/emotion from the other and build from it. Your reply must show you listened: echo + progression.",
  },
  E4: {
    es:
      "Status: juega con estatus alto/bajo (sin decirlo). Marca tu postura con gestos, tono y decisiones. El estatus puede cambiar, pero debe sentirse.",
    en:
      "Status: play high/low status (without naming it). Show it via posture, tone, and choices. Status can shift, but it must be felt.",
  },
  E5: {
    es:
      "Deseo / Muro: tu personaje quiere algo muy concreto y hay un obstáculo claro que lo impide. Cada frase debe empujar hacia el deseo o chocar con el muro.",
    en:
      "Desire / Wall: your character wants something specific and there’s a clear obstacle. Every line pushes toward the desire or hits the wall.",
  },
  E6: {
    es:
      "Oferta única: haz una sola oferta potente (una propuesta/acción) y sosténla. No lances diez ideas: una, clara, y dale consecuencias.",
    en:
      "Single offer: make one strong offer (proposal/action) and hold it. Don’t throw ten ideas—one, clear, with consequences.",
  },
  E7: {
    es:
      "Profecía inevitable: actúa como si ya supieras el final y cada detalle te empuja hacia él. Si intentas evitarlo, lo aceleras. Tensión y destino.",
    en:
      "Inevitable prophecy: behave as if you already know the ending and everything pulls you to it. Trying to avoid it accelerates it. Fate tension.",
  },
  E8: {
    es:
      "Mensajero: traes un mensaje importante y debes entregarlo. El otro reacciona: tú ajustas, pero no pierdes el objetivo. El mensaje cambia la escena.",
    en:
      "Messenger: you carry an important message and must deliver it. The other reacts; you adapt but keep the objective. The message changes the scene.",
  },
  E9: {
    es:
      "Puerta / Umbral: estás a punto de cruzar un límite (literal o emocional). Juega el ‘antes’ y el ‘después’. La decisión pesa.",
    en:
      "Door / Threshold: you are about to cross a boundary (literal or emotional). Play the ‘before’ and ‘after’. The decision matters.",
  },
  E10: {
    es:
      "Coro interrumpe: mete un ‘coro’ breve (una frase ritual, un comentario recurrente, un leitmotiv) que aparece de vez en cuando y modifica el ritmo.",
    en:
      "Chorus interrupts: introduce a short ‘chorus’ (ritual phrase / recurring comment / leitmotif) that returns occasionally and shifts the rhythm.",
  },
  E11: {
    es:
      "Máscara y grieta: sostén una máscara (imagen social) pero deja que se vea una grieta. No confieses todo: filtra vulnerabilidad entre líneas.",
    en:
      "Mask & crack: hold a social mask, but let a crack show. Don’t confess everything—let vulnerability leak between lines.",
  },
  E12: {
    es:
      "Eco final: repite un elemento del inicio (palabra/objeto/gesto) al final para cerrar con resonancia. No expliques: deja el eco.",
    en:
      "Final echo: bring back an element from the start (word/object/gesture) at the end to close with resonance. Don’t explain—leave the echo.",
  },
};

export const LEVEL_UNLOCKS: Record<1 | 2 | 3 | 4, ExerciseId[]> = {
  1: ["E1", "E2", "E3", "E5", "E12"],
  2: ["E1", "E2", "E3", "E5", "E12", "E4", "E6", "E8", "E9"],
  3: ["E1", "E2", "E3", "E5", "E12", "E4", "E6", "E8", "E9", "E7", "E11"],
  4: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12"],
};

// character.slug -> ejercicios permitidos (3 por personaje)
export const CHARACTER_ALLOWED: Record<string, ExerciseId[]> = {
  athena: ["E1", "E5", "E12"],
  dionysus: ["E2", "E9", "E10"],
  hermes: ["E8", "E6", "E3"],
  hera: ["E4", "E11", "E5"],
  apollo: ["E7", "E1", "E12"],
  medusa: ["E11", "E4", "E3"],
  minotaur: ["E9", "E5", "E2"],
  sirena: ["E11", "E6", "E3"],
  cerbero: ["E9", "E10", "E12"],
  esfinge: ["E7", "E5", "E1"],
};

export function clampLevel(n: unknown): 1 | 2 | 3 | 4 {
  const x = Number(n);
  if (x >= 4) return 4;
  if (x >= 3) return 3;
  if (x >= 2) return 2;
  return 1;
}

/** Valida "E1".."E12" y devuelve fallback seguro */
export function normalizeExerciseId(
  raw: unknown,
  fallback: ExerciseId = "E1"
): ExerciseId {
  const s = String(raw ?? "");
  if (/^E(1|2|3|4|5|6|7|8|9|10|11|12)$/.test(s)) return s as ExerciseId;
  return fallback;
}

/**
 * Devuelve ejercicios disponibles para un personaje y nivel:
 * (CHARACTER_ALLOWED[slug] || ALL) ∩ LEVEL_UNLOCKS[level]
 * Si por algún motivo queda vacío, hace fallback a LEVEL_UNLOCKS[level].
 */
export function getAvailableExercises(
  charSlug: string,
  level: 1 | 2 | 3 | 4
): ExerciseId[] {
  const byLevel = new Set<ExerciseId>(LEVEL_UNLOCKS[level] ?? LEVEL_UNLOCKS[1]);
  const byChar = CHARACTER_ALLOWED[charSlug]
    ? (CHARACTER_ALLOWED[charSlug] as ExerciseId[])
    : (Object.keys(EXERCISE_LABELS) as ExerciseId[]);

  const out = byChar.filter((e) => byLevel.has(e));
  return out.length ? out : Array.from(byLevel);
}

export function exerciseLabel(exerciseId: ExerciseId, lang: "es" | "en") {
  return EXERCISE_LABELS[exerciseId]?.[lang] ?? exerciseId;
}

export function exerciseDesc(exerciseId: ExerciseId, lang: "es" | "en") {
  return EXERCISE_DESC[exerciseId]?.[lang] ?? "";
}

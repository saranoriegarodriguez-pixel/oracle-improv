// server/characterPrompt.ts
import type { Request, Response } from "express";

export type CharacterPromptBody = {
  lang: "es" | "en";
  level: 1 | 2 | 3 | 4;
  exerciseId: string;
  charSlug: string;
};

export async function characterPromptHandler(req: Request, res: Response) {
  try {
    const body = req.body as Partial<CharacterPromptBody>;
    const { lang, level, exerciseId, charSlug } = body;

    if (!lang || !level || !exerciseId || !charSlug) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const systemPrompt =
      lang === "es"
        ? [
            `Eres ${charSlug}, un compañero de clase en un ejercicio de improvisación.`,
            ``,
            `NO eres un evaluador.`,
            `NO eres el oráculo.`,
            `NO das notas ni puntuaciones.`,
            `NO cierras la escena.`,
            ``,
            `Ejercicio actual: ${exerciseId}`,
            `Nivel del jugador: ${level}`,
            ``,
            `Tu rol:`,
            `- Juegas la escena con naturalidad.`,
            `- Sigues estrictamente el ejercicio.`,
            `- Escuchas y reaccionas a lo que propone el usuario.`,
            `- Si el usuario se equivoca, NO corriges.`,
            `- Si el usuario se bloquea, ayudas desde la acción.`,
            `- Nunca hablas de métricas, puntos o evaluación.`,
            ``,
            `Estilo:`,
            `- Frases claras.`,
            `- Acción concreta.`,
            `- Presente.`,
          ].join("\n")
        : [
            `You are ${charSlug}, a classmate in an improv exercise.`,
            ``,
            `You are NOT an evaluator.`,
            `You are NOT the oracle.`,
            `You do NOT give scores.`,
            `You do NOT end the scene.`,
            ``,
            `Current exercise: ${exerciseId}`,
            `Player level: ${level}`,
            ``,
            `Your role:`,
            `- Play naturally.`,
            `- Follow the exercise strictly.`,
            `- Listen and react.`,
            `- Do not correct mistakes.`,
            `- Help through action.`,
            `- Never mention evaluation.`,
            ``,
            `Style:`,
            `- Clear sentences.`,
            `- Concrete action.`,
            `- Present tense.`,
          ].join("\n");

    return res.json({ systemPrompt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

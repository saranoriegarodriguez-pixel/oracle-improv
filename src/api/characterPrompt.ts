// src/api/characterPrompt.ts

type Lang = "es" | "en";
type ExerciseId = `E${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;

export type CharacterPromptRequest = {
  lang: Lang;
  exerciseId: ExerciseId;
  charSlug: string;
};

export type CharacterPromptResponse = {
  systemPrompt: string;
  headerText: string;
  meta: {
    charName: string;
  };
};

export async function fetchCharacterPrompt(
  body: CharacterPromptRequest
): Promise<CharacterPromptResponse> {
  const res = await fetch("/api/characterPrompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return res.json();
}

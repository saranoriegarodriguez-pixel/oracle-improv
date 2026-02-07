// server/types.ts

export type ProviderName = "ollama" | "openai";
export type Mode = "train" | "scene" | "trial";

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  provider?: ProviderName;

  // modelo opcional (si no viene, el provider usa su default)
  model?: string;

  // modo para caps de OpenAI (train/scene/trial)
  mode?: Mode;

  messages: ChatMessage[];

  stream?: boolean;
  temperature?: number;

  // --- tracking / limits (solo lo usa OpenAI si activas middleware) ---
  sessionId?: string; // 1 por sesión (ej: 8 min)
  username?: string; // opcional: para que el límite sea por usuario

  // override manual explícito (si lo mandas, gana a cualquier cap)
  maxOutputTokens?: number;
};

export type ChatResponse = {
  provider: ProviderName;
  model: string;
  message: ChatMessage;
  raw?: any;
};

export type Lang = "es" | "en";

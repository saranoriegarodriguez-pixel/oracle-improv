// src/api/chat.ts

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ProviderName = "ollama" | "openai";
export type Mode = "train" | "scene" | "trial";

export type ChatRequest = {
  provider?: ProviderName;
  model?: string;

  // caps OpenAI por modo
  mode?: Mode;

  // tracking (si usas limits)
  sessionId?: string;
  username?: string;

  // override manual si quieres
  maxOutputTokens?: number;

  temperature?: number;
  messages: ChatMessage[];
};

export type ChatResponse = {
  provider: ProviderName;
  model: string;
  message?: { role: string; content: string };

  // tolerancia por si algún provider devuelve otros formatos
  choices?: Array<{ message?: { content?: string } }>;
  output?: { content?: string };

  raw?: any;
  error?: string;
};

export async function apiChat(params: ChatRequest): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: params.provider,
      model: params.model,
      mode: params.mode,
      sessionId: params.sessionId,
      username: params.username,
      maxOutputTokens: params.maxOutputTokens,
      temperature: params.temperature ?? 0.7,
      messages: params.messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `HTTP ${res.status}`);
  }

  return (await res.json()) as ChatResponse;
}

export function pickChatText(out: ChatResponse): string {
  return (
    out?.message?.content ??
    out?.choices?.[0]?.message?.content ??
    out?.output?.content ??
    ""
  );
}

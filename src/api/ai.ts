// src/api/ai.ts

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  provider?: "ollama" | "openai";
  model?: string;
  messages: ChatMessage[];
  stream?: boolean;
};

// ✅ Tu backend Express (donde está /api/chat y auth)
const API_BASE = "http://localhost:3000";

export async function chatAI(body: ChatRequest) {
  // ✅ Llamamos a Express, NO a Ollama directamente
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ✅ para enviar cookies de sesión si hacen falta
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatRequest = {
  provider?: "ollama" | "openai";
  model?: string;
  messages: ChatMessage[];
  stream?: boolean;
};

export async function chatAI(body: ChatRequest) {
  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}

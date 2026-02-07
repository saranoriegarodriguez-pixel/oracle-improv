// server/providers/ollama.ts
import type { ChatRequest, ChatResponse } from "../types";
import { OLLAMA_BASE_URL, OLLAMA_DEFAULT_MODEL, OLLAMA_ORACLE_MODEL } from "../env";

export async function chatWithOllama(
  req: ChatRequest & { oracle?: boolean }
): Promise<ChatResponse> {
  const model = req.oracle ? OLLAMA_ORACLE_MODEL : (req.model ?? OLLAMA_DEFAULT_MODEL);

  const r = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: req.messages,
      stream: false,

      // ✅ CLAVE para el oráculo: salida JSON estable
      ...(req.oracle ? { format: "json" } : null),

      options:
        typeof req.temperature === "number"
          ? { temperature: req.temperature }
          : undefined,
    }),
  });

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Ollama error ${r.status}: ${text}`);
  }

  const json: any = await r.json();

  return {
    provider: "ollama",
    model,
    message: {
      role: "assistant",
      content: json?.message?.content ?? "",
    },
    raw: json,
  };
}

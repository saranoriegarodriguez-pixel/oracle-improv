// src/pages/auth/Login.tsx
import { useLocation } from "react-router-dom";
import { useState } from "react";

const RAW_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "";

// Si hay VITE_API_BASE_URL -> modo backend directo (Render)
// Si no -> modo proxy (mismo dominio), usa rutas relativas /api/...
const API_BASE = RAW_BASE ? RAW_BASE.replace(/\/$/, "") : "";

export default function Login() {
  const loc = useLocation();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const params = new URLSearchParams(loc.search);

  // next puede venir como "/app", "/app/profile", etc.
  const rawNext = params.get("next") ?? "/app";
  const frontendOrigin = window.location.origin;

  // normaliza next a URL absoluta del FRONTEND
  const next =
    rawNext.startsWith("http")
      ? rawNext
      : `${frontendOrigin}${rawNext.startsWith("/") ? "" : "/"}${rawNext}`;

  const onGoogleLogin = async () => {
    setErr(null);
    setBusy(true);

    try {
      // ✅ start siempre en BACKEND… pero si hay proxy, lo llamamos en misma origin
      const startUrl = `${API_BASE}/api/auth/google/start?next=${encodeURIComponent(
        next
      )}`;

      const r = await fetch(startUrl, {
        method: "GET",
        credentials: "include",
      });

      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        throw new Error(`OAuth start failed ${r.status}: ${txt || r.statusText}`);
      }

      const data = (await r.json()) as { url?: string };
      if (!data.url) throw new Error("Missing url from backend");

      window.location.href = data.url;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1>Iniciar sesión</h1>
      <p>Para entrar en la app necesitas iniciar sesión con Google.</p>

      <button
        onClick={() => void onGoogleLogin()}
        disabled={busy}
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,.18)",
          background: "rgba(255,255,255,.06)",
          color: "inherit",
          cursor: busy ? "not-allowed" : "pointer",
          width: "100%",
          fontSize: 16,
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? "Abriendo Google…" : "Entrar con Google"}
      </button>

      {err && (
        <p style={{ marginTop: 12, color: "#ff6b6b", whiteSpace: "pre-wrap" }}>
          {err}
        </p>
      )}
    </div>
  );
}
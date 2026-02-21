// src/pages/auth/Login.tsx
import { useLocation } from "react-router-dom";
import { useState } from "react";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://oracle-improv-api.onrender.com";

export default function Login() {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Puede venir como "/app", "/app/profile", etc.
  const rawNext = params.get("next") ?? "/app";
  const frontendOrigin = window.location.origin;

  // Normalizamos next a URL absoluta del frontend
  const next =
    rawNext.startsWith("http")
      ? rawNext
      : `${frontendOrigin}${rawNext.startsWith("/") ? "" : "/"}${rawNext}`;

  const onGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

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
      if (!data.url) {
        throw new Error("Backend did not return OAuth URL.");
      }

      // Redirección real a Google
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError("No se pudo iniciar sesión con Google.");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1>Iniciar sesión</h1>
      <p>Para entrar en la app necesitas iniciar sesión con Google.</p>

      <button
        onClick={() => void onGoogleLogin()}
        disabled={loading}
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,.18)",
          background: loading
            ? "rgba(255,255,255,.03)"
            : "rgba(255,255,255,.06)",
          color: "inherit",
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%",
          fontSize: 16,
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Redirigiendo…" : "Entrar con Google"}
      </button>

      {error && (
        <div style={{ marginTop: 16, color: "#ff6b6b", fontSize: 14 }}>
          {error}
        </div>
      )}
    </div>
  );
}
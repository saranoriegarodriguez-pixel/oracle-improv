// src/pages/auth/Login.tsx
import { useLocation } from "react-router-dom";

export default function Login() {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);

  const rawNext = params.get("next") ?? "/app";
  const frontendOrigin = window.location.origin;

  const next =
    rawNext.startsWith("http")
      ? rawNext
      : `${frontendOrigin}${rawNext.startsWith("/") ? "" : "/"}${rawNext}`;

  const onGoogleLogin = async () => {
    const startPath = `/api/auth/google/start?next=${encodeURIComponent(next)}`;

    const r = await fetch(startPath, {
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
  };

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1>Iniciar sesión</h1>
      <p>Para entrar en la app necesitas iniciar sesión con Google.</p>

      <button
        onClick={() => void onGoogleLogin()}
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,.18)",
          background: "rgba(255,255,255,.06)",
          color: "inherit",
          cursor: "pointer",
          width: "100%",
          fontSize: 16,
        }}
      >
        Entrar con Google
      </button>
    </div>
  );
}
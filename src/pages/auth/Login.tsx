// src/pages/auth/Login.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../state/authStore";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  ""; // ✅ con proxy: queda ""

export default function Login() {
  const loc = useLocation();
  const nav = useNavigate();
  const { status, refresh } = useAuthStore();

  const params = new URLSearchParams(loc.search);

  // ✅ el destino tras login
  const rawNext = params.get("next") ?? "/app";

  // ✅ fuerza a que siempre sea ruta interna
  const nextPath = rawNext.startsWith("/") ? rawNext : `/${rawNext}`;

  // ✅ 1) al entrar en /login, comprueba si ya hay sesión (cookie)
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // ✅ 2) si ya estás logueada, vete a /app (o next)
  useEffect(() => {
    if (status === "authed") {
      nav(nextPath, { replace: true });
    }
  }, [status, nextPath, nav]);

  const onGoogleLogin = async () => {
    // ✅ START entra por el mismo dominio (Vercel) y Vercel lo reescribe a Render
    const startUrl = `${API_BASE}/api/auth/google/start?next=${encodeURIComponent(
      nextPath
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
  };

  // ✅ mientras estamos comprobando cookie
  if (status === "unknown" || status === "loading") {
    return <div style={{ padding: 24 }}>Cargando sesión…</div>;
  }

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
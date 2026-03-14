// src/pages/auth/Login.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../state/authStore";
import "./Login.css";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "";

export default function Login() {
  const loc = useLocation();
  const nav = useNavigate();
  const { status, refresh } = useAuthStore();

  const params = new URLSearchParams(loc.search);

  const rawNext = params.get("next") ?? "/app";
  const nextPath = rawNext.startsWith("/") ? rawNext : `/${rawNext}`;

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (status === "authed") {
      nav(nextPath, { replace: true });
    }
  }, [status, nextPath, nav]);

  const onGoogleLogin = async () => {
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

  if (status === "unknown" || status === "loading") {
    return (
      <div className="loginPage">
        <div className="loginBg" aria-hidden />
        <div className="loginLoadingCard">
          <div className="loginSpinner" aria-hidden />
          <p className="loginLoadingText">Cargando sesión…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loginPage">
      <div className="loginBg" aria-hidden />

      <div className="loginShell">
        <div className="loginCard">
          <div className="loginEyebrow">ORACLE IMPROV</div>

          <h1 className="loginTitle">Iniciar sesión</h1>

          <p className="loginText">
            Para entrar en la app necesitas iniciar sesión con Google.
          </p>

          <button onClick={() => void onGoogleLogin()} className="loginGoogleBtn">
            <span className="loginGoogleBtn__icon" aria-hidden>
              G
            </span>
            <span>Entrar con Google</span>
          </button>

          <p className="loginNote">
            Tu sesión se usará para acceder a la app y mantener tu progreso.
          </p>
        </div>
      </div>
    </div>
  );
}
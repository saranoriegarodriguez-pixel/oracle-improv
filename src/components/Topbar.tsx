// src/components/Topbar.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSettings } from "../state/appSettings";
import "./Topbar.css";

export default function Topbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { st, setLang } = useAppSettings();

  const lang = (st.lang ?? "es") as "es" | "en";

  // ✅ Estamos en zona app si /app o /app/*
  const inApp = loc.pathname === "/app" || loc.pathname.startsWith("/app/");

  // ✅ Estamos en portfolio si NO estamos en /app*
  const inPortfolio = !inApp;

  return (
    <header className="topbar">
      <div className="topbar__inner">
        {/* 🌐 Portfolio */}
        <button
          className="topbar__iconBtn"
          type="button"
          onClick={() => nav("/")}
          aria-label={lang === "es" ? "Ir al portfolio" : "Go to portfolio"}
          title={lang === "es" ? "Portfolio" : "Portfolio"}
          disabled={inPortfolio}
        >
          <span className="topbar__icon" aria-hidden>
            🌐
          </span>
        </button>

        {/* 🏠 App */}
        <button
          className="topbar__iconBtn"
          type="button"
          onClick={() => nav("/app")}
          aria-label={lang === "es" ? "Ir a la app" : "Go to app"}
          title={lang === "es" ? "App" : "App"}
          disabled={inApp && (loc.pathname === "/app" || loc.pathname === "/app/")}
        >
          <span className="topbar__icon" aria-hidden>
            🏠
          </span>
        </button>

        <div className="topbar__spacer" />

        {/* Idioma (siempre visible) */}
        <div className="topbar__lang" role="group" aria-label="Language">
          <button
            className={`pill ${lang === "es" ? "pill--active" : ""}`}
            type="button"
            onClick={() => setLang("es")}
            aria-pressed={lang === "es"}
          >
            ES
          </button>
          <button
            className={`pill ${lang === "en" ? "pill--active" : ""}`}
            type="button"
            onClick={() => setLang("en")}
            aria-pressed={lang === "en"}
          >
            EN
          </button>
        </div>

        {/* ✅ Solo en la app: Perfil + Ajustes */}
        {inApp && (
          <>
            <button
              className="topbar__iconBtn topbar__iconBtn--profile"
              type="button"
              onClick={() => nav("/app/profile")}
              title={lang === "es" ? "Perfil" : "Profile"}
              aria-label={lang === "es" ? "Perfil" : "Profile"}
            >
              <span className="topbar__icon" aria-hidden>
                👤
              </span>
            </button>

            <button
              className="topbar__iconBtn topbar__iconBtn--settings"
              type="button"
              onClick={() => nav("/app/settings")}
              title={lang === "es" ? "Ajustes" : "Settings"}
              aria-label={lang === "es" ? "Ajustes" : "Settings"}
            >
              <span className="topbar__icon" aria-hidden>
                ⚙
              </span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

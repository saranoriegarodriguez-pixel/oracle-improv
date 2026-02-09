// src/components/Topbar.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSettings } from "../state/appSettings";
import {
  getPortfolioLang,
  switchLangPath,
  type Lang as PortfolioLang,
} from "../pages/portfolio/lang";
import "./Topbar.css";

type UiLang = "es" | "en";

export default function Topbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { st, setLang } = useAppSettings();

  // Idioma global (app)
  const appLang: UiLang = (st.lang ?? "es") as UiLang;

  // Zona actual
  const inApp = loc.pathname === "/app" || loc.pathname.startsWith("/app/");
  const portfolioLang: PortfolioLang = getPortfolioLang(loc.pathname) ?? "es";
  const inPortfolio = !!getPortfolioLang(loc.pathname);

  // Idioma “activo” para la UI (depende de dónde estés)
  const lang: UiLang = inPortfolio ? portfolioLang : appLang;

  function goPortfolioHome() {
    nav(`/${portfolioLang}`);
  }

  function goAppHome() {
    nav("/app/home");
  }

  function onToggleLang(next: UiLang) {
    // Portfolio: cambia la ruta (/es/... <-> /en/...)
    if (inPortfolio) {
      nav(switchLangPath(loc.pathname, next));
      return;
    }

    // App: solo cambia estado (no toca la ruta)
    setLang(next);
  }

  const portfolioBtnDisabled =
    inPortfolio && (loc.pathname === `/${portfolioLang}` || loc.pathname === `/${portfolioLang}/`);

  const appBtnDisabled =
    inApp &&
    (loc.pathname === "/app" ||
      loc.pathname === "/app/" ||
      loc.pathname === "/app/home");

  return (
    <header className="topbar">
      <div className="topbar__inner">
        {/* 🌐 Portfolio */}
        <button
          className="topbar__iconBtn"
          type="button"
          onClick={goPortfolioHome}
          aria-label={lang === "es" ? "Ir al portfolio" : "Go to portfolio"}
          title="Portfolio"
          disabled={portfolioBtnDisabled}
        >
          <span className="topbar__icon" aria-hidden>
            🌐
          </span>
        </button>

        {/* 🏠 App */}
        <button
          className="topbar__iconBtn"
          type="button"
          onClick={goAppHome}
          aria-label={lang === "es" ? "Ir a la app" : "Go to app"}
          title="App"
          disabled={appBtnDisabled}
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
            onClick={() => onToggleLang("es")}
            aria-pressed={lang === "es"}
          >
            ES
          </button>

          <button
            className={`pill ${lang === "en" ? "pill--active" : ""}`}
            type="button"
            onClick={() => onToggleLang("en")}
            aria-pressed={lang === "en"}
          >
            EN
          </button>
        </div>

        {/* Solo en la app: Perfil + Ajustes */}
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
                ⚙️
              </span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

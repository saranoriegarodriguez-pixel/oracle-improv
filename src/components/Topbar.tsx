// src/components/Topbar.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSettings } from "../state/appSettings";
import { useSwitchLangPath } from "../pages/portfolio/lang";
import "./Topbar.css";

export default function Topbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { st, setLang } = useAppSettings();

  // Estado global (app)
  const appLang = (st.lang ?? "es") as "es" | "en";

  // Zona
  const inApp = loc.pathname === "/app" || loc.pathname.startsWith("/app/");
  const inPortfolio = !inApp;

  // Idioma real del portfolio (sale del pathname)
  const portfolioLang = (loc.pathname.startsWith("/en") ? "en" : "es") as "es" | "en";

  // Lang “activo” para UI (depende de dónde estés)
  const lang = inPortfolio ? portfolioLang : appLang;

  // Cambiar idioma manteniendo ruta (solo portfolio)
  const switchPortfolioPath = useSwitchLangPath();

  function goPortfolioHome() {
    nav(`/${lang}`);
  }

  function goAppHome() {
    nav("/app/home");
  }

  function onToggleLang(next: "es" | "en") {
    if (inPortfolio) {
      nav(switchPortfolioPath(next));
      return;
    }
    setLang(next);
  }

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
          disabled={inPortfolio && (loc.pathname === `/${lang}` || loc.pathname.startsWith(`/${lang}/`))}
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
          disabled={inApp && (loc.pathname === "/app" || loc.pathname === "/app/" || loc.pathname === "/app/home")}
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
                ⚙
              </span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

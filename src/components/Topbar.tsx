// src/components/Topbar.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSettings } from "../state/appSettings";
import {
  useLang,
  useSwitchLangPath,
  type Lang,
} from "../pages/portfolio/lang";
import "./Topbar.css";

export default function Topbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { st, setLang } = useAppSettings();

  const inApp = loc.pathname === "/app" || loc.pathname.startsWith("/app/");
  const portfolioLang = useLang();
  const appLang = (st.lang ?? "es") as Lang;
  const lang = inApp ? appLang : portfolioLang;

  const switchPortfolioPath = useSwitchLangPath();

  function goPortfolioHome() {
    nav(`/${lang}`);
  }

  function goAppHome() {
    nav("/app/home");
  }

  function onToggleLang(next: Lang) {
    if (inApp) {
      setLang(next);
    } else {
      nav(switchPortfolioPath(next));
    }
  }

  return (
    <header className="topbar">
      <div className="topbar__inner">

        {/* Portfolio */}
        <button
          className="topbar__iconBtn"
          onClick={goPortfolioHome}
          disabled={!inApp && loc.pathname === `/${lang}`}
          title="Portfolio"
        >
          🌐
        </button>

        {/* App */}
        <button
          className="topbar__iconBtn"
          onClick={goAppHome}
          disabled={inApp && loc.pathname === "/app/home"}
          title="App"
        >
          🏠
        </button>

        <div className="topbar__spacer" />

        {/* Idioma (siempre visible) */}
        <div className="topbar__lang" role="group" aria-label="Language">
          <button
            className={`pill ${lang === "es" ? "pill--active" : ""}`}
            onClick={() => onToggleLang("es")}
            aria-pressed={lang === "es"}
          >
            ES
          </button>
          <button
            className={`pill ${lang === "en" ? "pill--active" : ""}`}
            onClick={() => onToggleLang("en")}
            aria-pressed={lang === "en"}
          >
            EN
          </button>
        </div>

        {/* SOLO APP */}
        {inApp && (
          <>
            <button
              className="topbar__iconBtn"
              onClick={() => nav("/app/profile")}
              title="Profile"
            >
              👤
            </button>
            <button
              className="topbar__iconBtn"
              onClick={() => nav("/app/settings")}
              title="Settings"
            >
              ⚙️
            </button>
          </>
        )}
      </div>
    </header>
  );
}

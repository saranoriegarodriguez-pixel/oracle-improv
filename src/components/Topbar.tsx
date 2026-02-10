// src/components/Topbar.tsx
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Topbar.css";

import { useAppSettings } from "../state/appSettings";

type Lang = "es" | "en";

export default function Topbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { st, setLang } = useAppSettings();

  const lang: Lang = (st.lang ?? "es") as Lang;

  const inApp = loc.pathname === "/app" || loc.pathname.startsWith("/app/");
  const inCV = loc.pathname === "/cv";
  const inWork = loc.pathname === "/work" || loc.pathname.startsWith("/work/");
  const inAbout = loc.pathname === "/about";
  const inContact = loc.pathname === "/contact";

  const t = useMemo(() => {
    return lang === "es"
      ? {
          web: "Web",
          app: "App",
          work: "Proyectos",
          about: "Sobre mí",
          contact: "Contacto",
          cv: "CV",
          profile: "Perfil",
          settings: "Ajustes",
        }
      : {
          web: "Web",
          app: "App",
          work: "Work",
          about: "About",
          contact: "Contact",
          cv: "CV",
          profile: "Profile",
          settings: "Settings",
        };
  }, [lang]);

  function goWebHome() {
    nav("/");
  }

  function goAppHome() {
    nav("/app/home");
  }

  function onToggleLang(next: Lang) {
    setLang(next);
  }

  return (
    <header className="topbar">
      <div className="topbar__inner">
        {/* Left: Web + App quick buttons */}
        <div className="topbar__left">
          <button
            className="topbar__iconBtn"
            type="button"
            onClick={goWebHome}
            title={t.web}
            aria-label={t.web}
            disabled={!inApp && loc.pathname === "/"}
          >
            <span className="topbar__icon" aria-hidden>
              🌐
            </span>
          </button>

          <button
            className="topbar__iconBtn"
            type="button"
            onClick={goAppHome}
            title={t.app}
            aria-label={t.app}
            disabled={inApp && (loc.pathname === "/app" || loc.pathname === "/app/home")}
          >
            <span className="topbar__icon" aria-hidden>
              🏛️
            </span>
          </button>
        </div>

        {/* Center: portfolio nav only when NOT in /app */}
        {!inApp && (
          <nav className="topbar__nav" aria-label="Portfolio">
            <button
              className={`topbar__navLink ${inWork ? "is-active" : ""}`}
              type="button"
              onClick={() => nav("/work")}
            >
              {t.work}
            </button>
            <button
              className={`topbar__navLink ${inAbout ? "is-active" : ""}`}
              type="button"
              onClick={() => nav("/about")}
            >
              {t.about}
            </button>
            <button
              className={`topbar__navLink ${inContact ? "is-active" : ""}`}
              type="button"
              onClick={() => nav("/contact")}
            >
              {t.contact}
            </button>
            <button
              className={`topbar__navLink ${inCV ? "is-active" : ""}`}
              type="button"
              onClick={() => nav("/cv")}
            >
              {t.cv}
            </button>
          </nav>
        )}

        <div className="topbar__spacer" />

        {/* Language pills always visible */}
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

        {/* Right: app-only buttons */}
        {inApp && (
          <div className="topbar__appBtns" aria-label="App actions">
            <button
              className="topbar__iconBtn topbar__iconBtn--profile"
              type="button"
              onClick={() => nav("/app/profile")}
              title={t.profile}
              aria-label={t.profile}
            >
              <span className="topbar__icon" aria-hidden>
                👤
              </span>
            </button>

            <button
              className="topbar__iconBtn topbar__iconBtn--settings"
              type="button"
              onClick={() => nav("/app/settings")}
              title={t.settings}
              aria-label={t.settings}
            >
              <span className="topbar__icon" aria-hidden>
                ⚙️
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// src/components/Topbar.tsx
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../state/authStore";
import { useAppSettings } from "../state/appSettings";
import "./Topbar.css";

type TopbarMode = "portfolio" | "app";

const navCls = ({ isActive }: { isActive: boolean }) =>
  "topbar__iconLink" + (isActive ? " is-active" : "");

export default function Topbar({ mode }: { mode: TopbarMode }) {
  const auth = useAuthStore();
  const { st, setLang } = useAppSettings();
  const lang = (st.lang ?? "es") as "es" | "en";

  const loc = useLocation();
  const nav = useNavigate();

  const isAuthed = auth.status === "authed";

  const labels = {
    home: lang === "es" ? "Home" : "Home",
    work: lang === "es" ? "Work" : "Work",
    about: lang === "es" ? "Sobre mí" : "About",
    cv: "CV",
    contact: lang === "es" ? "Contacto" : "Contact",
    app: "App",
    profile: lang === "es" ? "Perfil" : "Profile",
    settings: lang === "es" ? "Ajustes" : "Settings",
    portfolio: lang === "es" ? "Portfolio" : "Portfolio",
    login: lang === "es" ? "Iniciar sesión" : "Sign in",
    goApp: lang === "es" ? "Ir a la app" : "Go to app",
    logout: lang === "es" ? "Cerrar sesión" : "Sign out",
  };

  const goLogin = () => {
    const next = loc.pathname + loc.search;
    nav(`/login?next=${encodeURIComponent(next)}`);
  };

  return (
    <header className={`topbar topbar--${mode}`}>
      <div className="topbar__inner">
        {/* LEFT BRAND */}
        <div className="topbar__left">
          <Link to="/" className="topbar__brand" aria-label="Sara Atelier Studio">
            <span className="topbar__brandMain">Sara Atelier</span>
            <span className="topbar__brandDot">•</span>
            <span className="topbar__brandSub">Studio</span>
          </Link>
        </div>

        {/* CENTER NAV (solo iconos) */}
        <nav className="topbar__nav" aria-label="Main navigation">
          {mode === "portfolio" ? (
            <>
              <NavLink to="/" className={navCls} aria-label={labels.home} title={labels.home}>
                🎪
              </NavLink>

              <NavLink to="/work" className={navCls} aria-label={labels.work} title={labels.work}>
                🧰
              </NavLink>

              <NavLink to="/about" className={navCls} aria-label={labels.about} title={labels.about}>
                🪪
              </NavLink>

              <NavLink to="/cv" className={navCls} aria-label={labels.cv} title={labels.cv}>
                📄
              </NavLink>

              <NavLink
                to="/contact"
                className={navCls}
                aria-label={labels.contact}
                title={labels.contact}
              >
                ✉️
              </NavLink>

              {/* App destacado */}
              <Link
                to="/app"
                className="topbar__iconLink topbar__iconLink--gold"
                aria-label={labels.app}
                title={labels.app}
              >
                🔮
              </Link>
            </>
          ) : (
            <>
              <NavLink to="/app" className={navCls} aria-label={labels.app} title={labels.app}>
                🔮
              </NavLink>

              <NavLink
                to="/app/profile"
                className={navCls}
                aria-label={labels.profile}
                title={labels.profile}
              >
                🪪
              </NavLink>

              <NavLink
                to="/app/settings"
                className={navCls}
                aria-label={labels.settings}
                title={labels.settings}
              >
                ⚙️
              </NavLink>

              <NavLink
                to="/"
                className={navCls}
                aria-label={labels.portfolio}
                title={labels.portfolio}
              >
                🎪
              </NavLink>
            </>
          )}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="topbar__right">
          {/* Lang pills */}
          <div className="topbar__lang" role="group" aria-label="Language">
            <button
              className={`topbar__pill ${lang === "es" ? "is-active" : ""}`}
              onClick={() => setLang("es")}
              type="button"
              aria-label="ES"
              title="ES"
            >
              ES
            </button>
            <button
              className={`topbar__pill ${lang === "en" ? "is-active" : ""}`}
              onClick={() => setLang("en")}
              type="button"
              aria-label="EN"
              title="EN"
            >
              EN
            </button>
          </div>

          {/* Portfolio: login/go app/logout */}
          {mode === "portfolio" ? (
            !isAuthed ? (
              <button
                className="topbar__iconBtn"
                onClick={goLogin}
                aria-label={labels.login}
                title={labels.login}
                type="button"
              >
                🔐
              </button>
            ) : (
              <>
                <Link
                  to="/app"
                  className="topbar__iconLink topbar__iconLink--gold"
                  aria-label={labels.goApp}
                  title={labels.goApp}
                >
                  🔮
                </Link>

                <button
                  className="topbar__iconBtn topbar__iconBtn--danger"
                  onClick={() => void auth.logout()}
                  aria-label={labels.logout}
                  title={labels.logout}
                  type="button"
                >
                  🚪
                </button>
              </>
            )
          ) : (
            // App: logout siempre visible
            <button
              className="topbar__iconBtn topbar__iconBtn--danger"
              onClick={() => void auth.logout()}
              aria-label={labels.logout}
              title={labels.logout}
              type="button"
            >
              🚪
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Topbar.css";

import { useAppSettings } from "../state/appSettings";
import { useAuthStore } from "../state/authStore";

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();

  const { st, setLang } = useAppSettings();
  const auth = useAuthStore();

  const isApp = useMemo(() => loc.pathname.startsWith("/app"), [loc.pathname]);
  const lang = (st.lang ?? "es") as "es" | "en";

  // ✅ Evita el error TS: no comparamos con "authenticated" directamente
  // (tu AuthStatus seguramente usa otros literales)
  const authStatus = (auth as any)?.status as string | undefined;
  const isAuthed =
    authStatus === "authenticated" ||
    authStatus === "authed" ||
    authStatus === "signed_in" ||
    authStatus === "logged_in" ||
    authStatus === "ready" ||
    Boolean((auth as any)?.user);

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    if ((auth as any)?.status === "unknown" && typeof (auth as any)?.refresh === "function") {
      (auth as any).refresh();
    }
  }, [auth]);

  const labels = useMemo(() => {
    if (lang === "en") {
      return {
        home: "Home",
        work: "Work",
        about: "About",
        contact: "Contact",
        cv: "CV",
        portfolio: "Portfolio",
        app: "App",
        profile: "Profile",
        settings: "Settings",
        logout: "Sign out",
        menuOpen: "Open menu",
        menuClose: "Close menu",
      };
    }
    return {
      home: "Home",
      work: "Work",
      about: "Sobre mí",
      contact: "Contacto",
      cv: "CV",
      portfolio: "Portfolio",
      app: "App",
      profile: "Perfil",
      settings: "Ajustes",
      logout: "Cerrar sesión",
      menuOpen: "Abrir menú",
      menuClose: "Cerrar menú",
    };
  }, [lang]);

  async function onLogout() {
    try {
      await fetch("/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // da igual; igualmente volvemos y refrescamos estado
    } finally {
      if (typeof (auth as any)?.refresh === "function") (auth as any).refresh();
      nav("/", { replace: true });
    }
  }

  return (
    <header className="tb">
      <div className="tb__inner">
        {/* Brand */}
        <NavLink to="/" className="tb__brand" aria-label="Ir a portfolio">
          <span className="tb__brandMain">Sara Atelier</span>
          <span className="tb__brandDot">•</span>
          <span className="tb__brandSub">Studio</span>
        </NavLink>

        {/* Tools (derecha) */}
        <div className="tb__tools">
          {/* Idioma rápido */}
          <div className="tb__lang" aria-label="Idioma">
            <button
              className={cx("tb__pill", lang === "es" && "is-active")}
              onClick={() => setLang("es")}
              type="button"
            >
              ES
            </button>
            <button
              className={cx("tb__pill", lang === "en" && "is-active")}
              onClick={() => setLang("en")}
              type="button"
            >
              EN
            </button>
          </div>

          {/* Iconos rápidos */}
          <div className="tb__quick">
            {/* 🌐 Portfolio */}
            <NavLink
              to="/"
              end
              className={({ isActive }) => cx("tb__iconBtn", isActive && !isApp && "is-active")}
              title={labels.portfolio}
              aria-label={labels.portfolio}
            >
              <span className="tb__emoji" aria-hidden="true">
                🌐
              </span>
            </NavLink>

            {/* 🔮 App */}
            <NavLink
              to="/app"
              className={() => cx("tb__iconBtn", isApp && "is-active")}
              title={labels.app}
              aria-label={labels.app}
            >
              <span className="tb__emoji" aria-hidden="true">
                🔮
              </span>
            </NavLink>

            {/* 👤 y ⚙️ solo dentro de /app */}
            {isApp ? (
              <>
                <NavLink
                  to="/app/profile"
                  className={({ isActive }) => cx("tb__iconBtn", isActive && "is-active")}
                  title={labels.profile}
                  aria-label={labels.profile}
                >
                  <span className="tb__emoji" aria-hidden="true">
                    👤
                  </span>
                </NavLink>

                <NavLink
                  to="/app/settings"
                  className={({ isActive }) => cx("tb__iconBtn", isActive && "is-active")}
                  title={labels.settings}
                  aria-label={labels.settings}
                >
                  <span className="tb__emoji" aria-hidden="true">
                    ⚙️
                  </span>
                </NavLink>
              </>
            ) : null}

            {/* 🚪 Logout (si hay sesión) */}
            {isAuthed ? (
              <button
                className="tb__iconBtn"
                onClick={onLogout}
                title={labels.logout}
                aria-label={labels.logout}
                type="button"
              >
                <span className="tb__emoji" aria-hidden="true">
                  🚪
                </span>
              </button>
            ) : null}
          </div>

          {/* Burger */}
          <button
            className={cx("tb__burger", open && "is-open")}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? labels.menuClose : labels.menuOpen}
            aria-expanded={open}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Nav (links de texto) */}
        <nav className={cx("tb__nav", open && "is-open")} aria-label="Navegación">
          <div className="tb__group">
            <NavLink to="/" end className={({ isActive }) => cx("tb__link", isActive && !isApp && "is-active")}>
              {labels.home}
            </NavLink>
            <NavLink to="/work" className={({ isActive }) => cx("tb__link", isActive && !isApp && "is-active")}>
              {labels.work}
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => cx("tb__link", isActive && !isApp && "is-active")}>
              {labels.about}
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => cx("tb__link", isActive && !isApp && "is-active")}>
              {labels.contact}
            </NavLink>
            <NavLink to="/cv" className={({ isActive }) => cx("tb__link", isActive && !isApp && "is-active")}>
              {labels.cv}
            </NavLink>
          </div>

          <div className="tb__sep" />

          <div className="tb__group">
            <NavLink to="/app" className={() => cx("tb__cta", isApp && "is-active")}>
              <span className="tb__emoji" aria-hidden="true">
                🔮
              </span>
              {labels.app}
            </NavLink>

            {isApp ? (
              <>
                <NavLink to="/app/profile" className="tb__ghost">
                  <span className="tb__emoji" aria-hidden="true">
                    👤
                  </span>
                  {labels.profile}
                </NavLink>

                <NavLink to="/app/settings" className="tb__ghost">
                  <span className="tb__emoji" aria-hidden="true">
                    ⚙️
                  </span>
                  {labels.settings}
                </NavLink>
              </>
            ) : null}

            {isAuthed ? (
              <button className="tb__ghost" onClick={onLogout} type="button">
                <span className="tb__emoji" aria-hidden="true">
                  🚪
                </span>
                {labels.logout}
              </button>
            ) : null}
          </div>

          {/* Idioma también en menú móvil */}
          <div className="tb__lang tb__lang--mobile">
            <button
              className={cx("tb__pill", lang === "es" && "is-active")}
              onClick={() => setLang("es")}
              type="button"
            >
              ES
            </button>
            <button
              className={cx("tb__pill", lang === "en" && "is-active")}
              onClick={() => setLang("en")}
              type="button"
            >
              EN
            </button>
          </div>
        </nav>
      </div>

      <button
        className={cx("tb__overlay", open && "is-open")}
        onClick={() => setOpen(false)}
        aria-label={labels.menuClose}
        type="button"
      />
    </header>
  );
}

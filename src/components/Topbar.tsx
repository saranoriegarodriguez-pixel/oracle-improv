// src/components/Topbar.tsx
import { useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Topbar.css";

import { useAppSettings } from "../state/appSettings";
import { useAuthStore } from "../state/authStore";

type Lang = "es" | "en";

export default function Topbar() {
  const navigate = useNavigate();
  const loc = useLocation();

  const { st } = useAppSettings() as any;
  const lang: Lang = (st?.lang ?? "es") as Lang;

  const auth = useAuthStore();
  const authed = auth.status === "authed";
  const displayName = auth.user?.name || auth.user?.email || "";

  const t = useMemo(() => {
    const es = lang === "es";
    return {
      home: es ? "Home" : "Home",
      profile: es ? "Perfil" : "Profile",
      settings: es ? "Settings" : "Settings",
      login: es ? "Entrar" : "Login",
      logout: es ? "Salir" : "Logout",
      ariaLogout: es ? "Cerrar sesión" : "Log out",
    };
  }, [lang]);

  const inApp = loc.pathname.startsWith("/app") || loc.pathname === "/profile" || loc.pathname === "/settings";

  async function handleLogout() {
    try {
      await auth.logout(); // ✅ llama /api/auth/logout y refresca /api/auth/me
    } finally {
      // al salir, te mando a login si estabas en /app
      if (inApp) navigate("/login", { replace: true });
    }
  }

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <div className="topbar__left">
          <button
            className="topbar__brand"
            type="button"
            onClick={() => navigate("/")}
            aria-label="Oracle Improv"
            title="Oracle Improv"
          >
            <span className="topbar__brandDot" aria-hidden />
            <span className="topbar__brandText">Oracle</span>
          </button>

          <nav className="topbar__nav" aria-label="Primary">
            <NavLink className="topbar__link" to="/">
              {t.home}
            </NavLink>
            <NavLink className="topbar__link" to="/profile">
              {t.profile}
            </NavLink>
            <NavLink className="topbar__link" to="/settings">
              {t.settings}
            </NavLink>
          </nav>
        </div>

        <div className="topbar__right">
          {/* Badge usuario (solo si authed) */}
          {authed && displayName ? (
            <div className="topbar__user" title={displayName}>
              <span className="topbar__userDot" aria-hidden />
              <span className="topbar__userText">{displayName}</span>
            </div>
          ) : null}

          {/* Botón login / logout */}
          {authed ? (
            <button
              className="topbar__iconBtn"
              type="button"
              onClick={handleLogout}
              aria-label={t.ariaLogout}
              title={t.logout}
            >
              🚪
            </button>
          ) : (
            <button
              className="topbar__btn"
              type="button"
              onClick={() => navigate(`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`)}
            >
              {t.login}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

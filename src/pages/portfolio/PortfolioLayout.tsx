// src/pages/portfolio/PortfolioLayout.tsx
import { Link, Outlet } from "react-router-dom";
import { useLang, useSwitchLangPath, withLang } from "./lang";
import "./portfolio.css";

export default function PortfolioLayout() {
  const lang = useLang();
  const switchPath = useSwitchLangPath();

  const t =
    lang === "es"
      ? { work: "Proyectos", about: "Sobre mí", contact: "Contacto" }
      : { work: "Work", about: "About", contact: "Contact" };

  return (
    <div className="portfolioLayout">
      <header className="portfolioTopbar">
        <div className="portfolioTopbar__left">
          {/* Logo: siempre vuelve al home del portfolio del idioma */}
          <Link className="portfolioBrand" to={withLang(lang, "/")}>
            saraatelier.studio
          </Link>
        </div>

        <nav className="portfolioTopbar__nav">
          <Link to={withLang(lang, "/work")}>{t.work}</Link>
          <Link to={withLang(lang, "/about")}>{t.about}</Link>
          <Link to={withLang(lang, "/contact")}>{t.contact}</Link>
        </nav>

        <div className="portfolioTopbar__right">
          <div className="langToggle">
            <Link className={lang === "es" ? "isActive" : ""} to={switchPath("es")}>
              ES
            </Link>
            <Link className={lang === "en" ? "isActive" : ""} to={switchPath("en")}>
              EN
            </Link>
          </div>

          {/* Botón para entrar a la app real */}
          <Link className="toAppBtn" to="/app/home">
            App
          </Link>
        </div>
      </header>

      <main className="portfolioMain">
        <Outlet />
      </main>
    </div>
  );
}

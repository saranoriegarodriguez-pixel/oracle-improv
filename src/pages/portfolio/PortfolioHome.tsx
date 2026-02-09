// src/pages/portfolio/PortfolioHome.tsx
import { Link } from "react-router-dom";
import { useLang, withLang } from "./lang";
import "./portfolio.css";

export default function PortfolioHome() {
  const lang = useLang();

  const t =
    lang === "es"
      ? {
          title: "Portfolio",
          subtitle: "Diseño y desarrollo de experiencias web",
          ctaWork: "Ver proyectos",
          ctaContact: "Contacto",
        }
      : {
          title: "Portfolio",
          subtitle: "Design and development of web experiences",
          ctaWork: "View work",
          ctaContact: "Contact",
        };

  return (
    <section className="portfolioHome">
      <h1>{t.title}</h1>
      <p>{t.subtitle}</p>

      <div className="portfolioHome__actions">
        <Link className="btn" to={withLang(lang, "/work")}>
          {t.ctaWork}
        </Link>
        <Link className="btn btn--ghost" to={withLang(lang, "/contact")}>
          {t.ctaContact}
        </Link>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { useLang, withLang } from "./lang";
import { PROJECTS } from "../../content/projects";
import ProjectCarousel from "../../components/portfolio/ProjectCarousel";
import "./portfolio.css";

export default function PortfolioHome() {
  const lang = useLang();

  const t =
    lang === "es"
      ? {
          badge: "Portfolio bilingüe",
          title: "Diseño + narrativa + sistemas",
          subtitle:
            "Proyectos donde la UX no es maquillaje: es dramaturgia. IA, vídeo, XR y herramientas para entrenar a personas reales.",
          ctaWork: "Ver proyectos",
          ctaContact: "Contactar",
          section: "Selección",
        }
      : {
          badge: "Bilingual portfolio",
          title: "Design + narrative + systems",
          subtitle:
            "Projects where UX isn’t decoration: it’s dramaturgy. AI, video, XR and tools that train real humans.",
          ctaWork: "See work",
          ctaContact: "Contact",
          section: "Selection",
        };

  return (
    <div className="pHome">
      <section className="pHero">
        <div className="pHero__kicker">
          <span className="badge badge--gold">{t.badge}</span>
          <span className="muted">Oráculo · Obsidiana / Fucsia / Oro</span>
        </div>

        <h1 className="pHero__title">{t.title}</h1>
        <p className="pHero__subtitle">{t.subtitle}</p>

        <div className="pHero__actions">
          <Link className="btn btn--accent" to={withLang(lang, "/work")}>
            {t.ctaWork}
          </Link>
          <Link className="btn btn--soft" to={withLang(lang, "/contact")}>
            {t.ctaContact}
          </Link>
        </div>
      </section>

      <section className="pSection">
        <div className="sectionTop">
          <h2 className="sectionTitle">{t.section}</h2>
          <Link className="linkAccent" to={withLang(lang, "/work")}>
            {lang === "es" ? "Ver todo →" : "View all →"}
          </Link>
        </div>

        <ProjectCarousel lang={lang} projects={PROJECTS} />
      </section>
    </div>
  );
}

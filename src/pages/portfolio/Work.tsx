// src/pages/portfolio/Work.tsx
import { Link } from "react-router-dom";
import "./Work.css";

import { useAppSettings } from "../../state/appSettings";
import { PROJECTS, type Project, type Lang } from "./projectsData";

function pick<T extends Record<Lang, string>>(obj: T, lang: Lang) {
  return obj[lang];
}

export default function Work() {
  const { st } = useAppSettings();
  const lang: Lang = st.lang === "en" ? "en" : "es";

  const title = lang === "es" ? "Work" : "Work";
  const subtitle =
    lang === "es"
      ? "Proyectos, prototipos y mundos en construcción."
      : "Projects, prototypes and worlds in progress.";

  const ariaLabel = lang === "es" ? "Proyectos" : "Projects";

  return (
    <main className="work">
      <header className="work__hero">
        <h1 className="work__title">{title}</h1>
        <p className="work__subtitle">{subtitle}</p>
      </header>

      <section className="work__grid" aria-label={ariaLabel}>
        {PROJECTS.map((p: Project) => (
          <Link key={p.slug} to={`/work/${p.slug}`} className="workCard">
            <div className="workCard__imgWrap">
              {/* Importante: no cortar la imagen */}
              <img
                className="workCard__img"
                src={p.cover}
                alt={pick(p.title, lang)}
                loading="lazy"
              />
            </div>

            <div className="workCard__body">
              <h2 className="workCard__title">{pick(p.title, lang)}</h2>
              <p className="workCard__tagline">{pick(p.tagline, lang)}</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}


// src/components/portfolio/ProjectCarousel.tsx
import { Link } from "react-router-dom";
import { useLang, withLang } from "../../pages/portfolio/lang";
import "./ProjectCarousel.css";

// Ajusta este tipo a tu projects.ts real si hace falta
type Project = {
  slug: string;
  title: { es: string; en: string };
  desc?: { es: string; en: string };
  cover?: string;
};

type Props = {
  projects: Project[];
};

export default function ProjectCarousel({ projects }: Props) {
  const lang = useLang();

  return (
    <div className="projectCarousel" aria-label="Projects">
      {projects.map((p) => {
        const href =
          p.slug === "oraculo-improv"
            ? withLang(lang, "/work/oraculo-improv")
            : withLang(lang, `/work/${p.slug}`);

        return (
          <Link key={p.slug} to={href} className="projectCard">
            {p.cover && <img src={p.cover} alt="" className="projectCard__img" />}
            <div className="projectCard__body">
              <div className="projectCard__title">{p.title[lang]}</div>
              {p.desc?.[lang] && <div className="projectCard__desc">{p.desc[lang]}</div>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

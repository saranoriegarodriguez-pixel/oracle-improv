import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Project, Lang } from "../../content/projects";
import { withLang } from "../../pages/portfolio/lang";
import "./ProjectCarousel.css";

type Props = {
  lang: Lang;
  projects: Project[];
  activeSlug?: string;
};

export default function ProjectCarousel({ lang, projects, activeSlug }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);

  const items = useMemo(() => projects, [projects]);
  const focusSlug = hoverSlug ?? activeSlug ?? items[0]?.slug;

  const t =
    lang === "es"
      ? { open: "Abrir", view: "Ver caso" }
      : { open: "Open", view: "View case" };

  return (
    <div className="pc">
      <div className="pc__rail" ref={scrollerRef}>
        {items.map((p) => {
          const isActive = p.slug === focusSlug;
          const cover = p.cover;

          return (
            <Link
              key={p.slug}
              to={withLang(lang, `/work/${p.slug}`)}
              className={`pcCard ${isActive ? "is-active" : ""}`}
              onMouseEnter={() => setHoverSlug(p.slug)}
              onMouseLeave={() => setHoverSlug(null)}
            >
              <div className="pcCard__media">
                {cover.kind === "image" ? (
                  <img
                    src={cover.src}
                    alt={p.title[lang]}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <video
                    src={cover.src}
                    poster={cover.poster}
                    muted
                    playsInline
                    preload="metadata"
                  />
                )}
                <div className="pcCard__veil" />
              </div>

              <div className="pcCard__body">
                <div className="pcCard__top">
                  <div className="pcCard__title">{p.title[lang]}</div>
                  {p.year && <div className="pcCard__year muted">{p.year}</div>}
                </div>

                <div className="pcCard__tagline muted">{p.tagline[lang]}</div>

                <div className="pcCard__tags">
                  {p.tags.slice(0, 4).map((tag) => (
                    <span className="pill" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pcCard__cta">
                  <span className="badge badge--accent">{t.view}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* panel de preview a la derecha */}
      <div className="pc__preview">
        {items
          .filter((p) => p.slug === focusSlug)
          .map((p) => (
            <div key={p.slug} className="pcPrev">
              <div className="pcPrev__kicker">
                <span className="badge badge--gold">{p.status?.[lang] ?? " "}</span>
                <span className="muted">{p.tags.join(" · ")}</span>
              </div>

              <h2 className="pcPrev__title">{p.title[lang]}</h2>
              <p className="pcPrev__text">{p.tagline[lang]}</p>

              <div className="pcPrev__actions">
                <Link className="btn btn--accent" to={withLang(lang, `/work/${p.slug}`)}>
                  {lang === "es" ? "Ver proyecto" : "View project"}
                </Link>

                {p.links?.[0]?.href && (
                  <a className="btn btn--soft" href={p.links[0].href}>
                    {p.links[0].label[lang]}
                  </a>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

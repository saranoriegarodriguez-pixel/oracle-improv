// src/pages/portfolio/ProjectPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./ProjectPage.css";

import { useAppSettings } from "../../state/appSettings";
import { PROJECTS } from "./projectsData";
import type { Project, Lang } from "./projectsData";

type Localized = { es: string; en: string };

type MediaItem =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; url: string; title: Localized; thumb?: string };

function pick(t: Localized, lang: Lang) {
  return lang === "es" ? t.es : t.en;
}

function isYouTubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "").trim();
      return id || null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return id;
      // Shorts: /shorts/ID
      const parts = u.pathname.split("/").filter(Boolean);
      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
      // Embed: /embed/ID
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    }
  } catch {
    // ignore
  }
  return null;
}

function getYouTubeThumb(url: string) {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function isDirectVideoFile(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function getEmbedUrl(url: string) {
  // YouTube → embed
  if (isYouTubeUrl(url)) {
    const id = getYouTubeId(url);
    if (id) return `https://www.youtube.com/embed/${id}`;
  }

  // Vimeo: https://vimeo.com/123456789 -> https://player.vimeo.com/video/123456789
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Fallback: si ya es embed/otra cosa
  return url;
}

function getVideoThumbHybrid(item: { url: string; thumb?: string }) {
  if (item.thumb) return item.thumb;
  const yt = getYouTubeThumb(item.url);
  if (yt) return yt;
  return null; // Vimeo/MP4 sin thumb -> fallback UI
}

function DemoTag({ kind }: { kind: Project["demo"][number]["kind"] }) {
  const label =
    kind === "app"
      ? "APP"
      : kind === "demo"
      ? "DEMO"
      : kind === "repo"
      ? "REPO"
      : "DOC";

  return <span className={`demoTag demoTag--${kind}`}>{label}</span>;
}

export default function ProjectPage() {
  const { slug } = useParams();
  const { st } = useAppSettings();
  const lang: Lang = st.lang === "en" ? "en" : "es";

  const project = useMemo(
    () => PROJECTS.find((p) => p.slug === slug),
    [slug]
  );

  const mediaItems: MediaItem[] = useMemo(() => {
    if (!project) return [];

    const images: MediaItem[] = (project.gallery ?? []).map((src, idx) => ({
      type: "image",
      src,
      alt: `${pick(project.title, lang)} - image ${idx + 1}`,
    }));

    const videos: MediaItem[] = (project.videos ?? []).map((v) => ({
      type: "video",
      url: v.url,
      title: v.title,
      thumb: v.thumb,
    }));

    // Orden: primero cover, luego gallery, luego vídeos (puedes cambiarlo)
    const cover: MediaItem[] = project.cover
      ? [{ type: "image", src: project.cover, alt: `${pick(project.title, lang)} - cover` }]
      : [];

    // Evita duplicar cover si ya está en gallery
    const coverSrc = (cover[0] as any)?.src;
    const imagesNoDup = images.filter((im) => im.type !== "image" || im.src !== coverSrc);

    return [...cover, ...imagesNoDup, ...videos];
  }, [project, lang]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [slug]);

  if (!project) {
    return (
      <main className="projectPage">
        <header className="projectPage__hero">
          <div className="projectPage__topRow">
            <Link className="projectPage__back" to="/work">
              ← {lang === "es" ? "Volver a Work" : "Back to Work"}
            </Link>
          </div>
          <h1 className="projectPage__title">
            {lang === "es" ? "Proyecto no encontrado" : "Project not found"}
          </h1>
        </header>
      </main>
    );
  }

  const active = mediaItems[activeIndex];

  return (
    <main className="projectPage">
      {/* HERO */}
      <header className="projectPage__hero">
        <div className="projectPage__topRow">
          <Link className="projectPage__back" to="/work">
            ← {lang === "es" ? "Volver a Work" : "Back to Work"}
          </Link>
        </div>

        <div className="projectPage__headGrid">
          {/* MEDIA (Steam-like) */}
          <section className="mediaPanel" aria-label="Media">
            <div className="mediaPanel__viewer">
              {!active ? (
                <div className="mediaPanel__empty">
                  {lang === "es" ? "Sin media todavía." : "No media yet."}
                </div>
              ) : active.type === "image" ? (
                <img
                  className="mediaPanel__img"
                  src={active.src}
                  alt={active.alt}
                  loading="eager"
                />
              ) : isDirectVideoFile(active.url) ? (
                <video className="mediaPanel__video" controls>
                  <source src={active.url} />
                  {lang === "es"
                    ? "Tu navegador no soporta vídeo."
                    : "Your browser does not support video."}
                </video>
              ) : (
                <iframe
                  className="mediaPanel__iframe"
                  src={getEmbedUrl(active.url)}
                  title={pick(active.title, lang)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* THUMBS STRIP */}
            {!!mediaItems.length && (
              <div className="mediaPanel__strip" role="list">
                {mediaItems.map((it, idx) => {
                  const isActive = idx === activeIndex;

                  if (it.type === "image") {
                    return (
                      <button
                        key={`img-${it.src}-${idx}`}
                        className={`thumb ${isActive ? "is-active" : ""}`}
                        onClick={() => setActiveIndex(idx)}
                        type="button"
                        aria-label={`${lang === "es" ? "Ver imagen" : "View image"} ${idx + 1}`}
                      >
                        <img className="thumb__img" src={it.src} alt="" loading="lazy" />
                      </button>
                    );
                  }

                  const thumb = getVideoThumbHybrid({ url: it.url, thumb: it.thumb });
                  return (
                    <button
                      key={`vid-${it.url}-${idx}`}
                      className={`thumb ${isActive ? "is-active" : ""}`}
                      onClick={() => setActiveIndex(idx)}
                      type="button"
                      aria-label={`${lang === "es" ? "Ver vídeo" : "View video"}: ${pick(
                        it.title,
                        lang
                      )}`}
                    >
                      {thumb ? (
                        <img className="thumb__img" src={thumb} alt="" loading="lazy" />
                      ) : (
                        <div className="thumb__fallback" aria-hidden="true" />
                      )}
                      <span className="thumb__play" aria-hidden="true">
                        ▶
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* INFO */}
          <aside className="infoPanel" aria-label="Project info">
            <h1 className="infoPanel__title">{pick(project.title, lang)}</h1>
            <p className="infoPanel__tagline">{pick(project.tagline, lang)}</p>
            <p className="infoPanel__desc">{pick(project.description, lang)}</p>

            {!!project.demo?.length && (
              <div className="infoPanel__actions">
                {project.demo.map((d, idx) => {
                  const label = pick(d.label, lang);

                  // Interno vs externo (si empieza por /, usamos Link)
                  const isInternal = d.url.startsWith("/");

                  const cls = `demoBtn demoBtn--${d.kind}`;

                  return isInternal ? (
                    <Link key={`${d.url}-${idx}`} to={d.url} className={cls}>
                      <DemoTag kind={d.kind} />
                      <span>{label}</span>
                    </Link>
                  ) : (
                    <a
                      key={`${d.url}-${idx}`}
                      href={d.url}
                      className={cls}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <DemoTag kind={d.kind} />
                      <span>{label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
      </header>

      {/* BODY */}
      <section className="projectPage__panel">
        <div className="projectGrid">
          {/* SECTIONS */}
          <div className="projectGrid__main">
            {(project.sections ?? []).map((s, i) => (
              <article key={i} className="projectBlock">
                <h2 className="projectBlock__title">{pick(s.title, lang)}</h2>
                <p className="projectBlock__body">{pick(s.body, lang)}</p>
              </article>
            ))}
          </div>

          {/* SIDE (opcional: más tarjetas) */}
          <aside className="projectGrid__side">
            {!!project.videos?.length && (
              <div className="sideCard">
                <div className="sideCard__title">{lang === "es" ? "Vídeos" : "Videos"}</div>
                <div className="sideCard__list">
                  {project.videos.map((v, idx) => (
                    <button
                      key={`${v.url}-${idx}`}
                      className="sideLink"
                      type="button"
                      onClick={() => {
                        // busca el índice en mediaItems
                        const mi = mediaItems.findIndex(
                          (it) => it.type === "video" && it.url === v.url
                        );
                        if (mi >= 0) setActiveIndex(mi);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      ▶ {pick(v.title, lang)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

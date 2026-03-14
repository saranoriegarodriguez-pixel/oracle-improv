import { useEffect } from "react";
import "./Work.css";
import { useAppSettings } from "../../state/appSettings";
import NetflixRow, { type NetflixItem } from "../../components/portfolio/NetflixRow";

export default function Work() {
  const { st } = useAppSettings();
  const lang = (st.lang ?? "es") as "es" | "en";

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t =
    lang === "es"
      ? {
          title: "Work",
          subtitle: "Un catálogo visual de proyectos, universos y sistemas.",
          row1: "Proyectos principales",
          row2: "Narrativa y mundos",
          row3: "IA, VR y experimentos",
        }
      : {
          title: "Work",
          subtitle: "A visual catalog of projects, worlds and systems.",
          row1: "Main projects",
          row2: "Narrative and worlds",
          row3: "AI, VR and experiments",
        };

  const projectsRow: NetflixItem[] = [
    {
      slug: "oraculo-improv",
      title: "Oracle-Improv",
      subtitle:
        lang === "es"
          ? "App para impro teatral con feedback"
          : "App for theatrical improv with feedback",
      image: "/media/portfolio/work/work-oraculo.png",
      badge: "App",
    },
    {
      slug: "cotilleos-del-olimpo",
      title: lang === "es" ? "Cotilleos del Olimpo" : "Olympus Gossip",
      subtitle:
        lang === "es"
          ? "Serie visual y narrativa"
          : "Visual and narrative series",
      image: "/media/portfolio/work/work-cotilleos.png",
      badge: lang === "es" ? "Serie" : "Series",
    },
    {
      slug: "rv-monta-tu-teatro",
      title: lang === "es" ? "RV · Monta tu Teatro" : "VR · Build Your Theatre",
      subtitle:
        lang === "es"
          ? "Dirección y espacio inmersivo"
          : "Direction and immersive space",
      image: "/media/portfolio/work/work-rv.png",
      badge: "VR",
    },
  ];

  const narrativeRow: NetflixItem[] = [
    {
      slug: "cotilleos-del-olimpo",
      title: lang === "es" ? "Olimpo" : "Olympus",
      subtitle:
        lang === "es"
          ? "Mito, ironía y deseo"
          : "Myth, irony and desire",
      image: "/media/portfolio/work/work-cotilleos.png",
    },
    {
      slug: "oraculo-improv",
      title: lang === "es" ? "Oráculo" : "Oracle",
      subtitle:
        lang === "es"
          ? "Sistema, ritual y evaluación"
          : "System, ritual and evaluation",
      image: "/media/portfolio/work/work-oraculo.png",
    },
  ];

  const experimentsRow: NetflixItem[] = [
    {
      slug: "rv-monta-tu-teatro",
      title: "VR Theatre",
      subtitle:
        lang === "es"
          ? "Espacio, escena y prototipo"
          : "Space, staging and prototype",
      image: "/media/portfolio/work/work-rv.png",
    },
    {
      slug: "oraculo-improv",
      title: lang === "es" ? "IA conversacional" : "Conversational AI",
      subtitle:
        lang === "es"
          ? "Personajes y feedback"
          : "Characters and feedback",
      image: "/media/portfolio/work/work-oraculo.png",
    },
  ];

  return (
    <main className="workPage">
      <header className="workPage__hero">
        <h1 className="workPage__title">{t.title}</h1>
        <p className="workPage__subtitle">{t.subtitle}</p>
      </header>

      <NetflixRow title={t.row1} items={projectsRow} />
      <NetflixRow title={t.row2} items={narrativeRow} />
      <NetflixRow title={t.row3} items={experimentsRow} />
    </main>
  );
}
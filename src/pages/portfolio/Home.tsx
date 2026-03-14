import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import { useAppSettings } from "../../state/appSettings";
import NetflixRow, { type NetflixItem } from "../../components/portfolio/NetflixRow";

export default function Home() {
  const { st } = useAppSettings();
  const lang = (st.lang ?? "es") as "es" | "en";

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t =
    lang === "es"
      ? {
          heroTitle: "Universos creativos entre escena, IA y experiencia inmersiva",
          heroText:
            "Proyectos construidos como mundos: narrativa, dirección, sistemas interactivos y una estética oscura con pulso teatral.",
          heroPrimary: "Ver Work",
          heroSecondary: "Abrir app",
          mainRow: "Proyectos principales",
          secondRow: "Explorar universos",
        }
      : {
          heroTitle: "Creative worlds between stage, AI and immersive experience",
          heroText:
            "Projects built like worlds: narrative, direction, interactive systems and a dark theatrical pulse.",
          heroPrimary: "View Work",
          heroSecondary: "Open app",
          mainRow: "Main projects",
          secondRow: "Explore worlds",
        };

  const mainItems: NetflixItem[] = [
    {
      slug: "oraculo-improv",
      title: "Oracle-Improv",
      subtitle:
        lang === "es"
          ? "Impro teatral con personajes y Oráculo evaluador"
          : "Theatrical improv with characters and an evaluator Oracle",
      image: "/media/portfolio/home/home_oracle_improv.png",
      badge: "App",
      cta: lang === "es" ? "Ver proyecto" : "View project",
    },
    {
      slug: "cotilleos-del-olimpo",
      title: lang === "es" ? "Cotilleos del Olimpo" : "Olympus Gossip",
      subtitle:
        lang === "es"
          ? "Serie narrativa entre mito, ironía y deseo"
          : "Narrative series between myth, irony and desire",
      image: "/media/portfolio/home/home_cotilleos.png",
      badge: lang === "es" ? "Serie" : "Series",
      cta: lang === "es" ? "Ver proyecto" : "View project",
    },
    {
      slug: "rv-monta-tu-teatro",
      title: lang === "es" ? "RV · Monta tu Teatro" : "VR · Build Your Theatre",
      subtitle:
        lang === "es"
          ? "Experiencia inmersiva para escena y espacio"
          : "Immersive experience for stage and space",
      image: "/media/portfolio/home/home_rv.png",
      badge: "VR",
      cta: lang === "es" ? "Ver proyecto" : "View project",
    },
  ];

  const secondaryItems: NetflixItem[] = [
    {
      slug: "cotilleos-del-olimpo",
      title: lang === "es" ? "Universo Olimpo" : "Olympus World",
      subtitle:
        lang === "es"
          ? "Lore, tono visual y tensión narrativa"
          : "Lore, visual tone and narrative tension",
      image: "/media/portfolio/home/home_cotilleos.png",
    },
    {
      slug: "oraculo-improv",
      title: lang === "es" ? "Sistema Oráculo" : "Oracle System",
      subtitle:
        lang === "es"
          ? "Evaluación, progreso y estructura"
          : "Evaluation, progression and structure",
      image: "/media/portfolio/home/home_oracle_improv.png",
    },
    {
      slug: "rv-monta-tu-teatro",
      title: lang === "es" ? "Escena inmersiva" : "Immersive staging",
      subtitle:
        lang === "es"
          ? "Espacio, dirección y composición"
          : "Space, direction and composition",
      image: "/media/portfolio/home/home_rv.png",
    },
  ];

  return (
    <main className="homePage">
      <section className="homeHero">
        <div className="homeHero__media">
          <img
            className="homeHero__img"
            src="/media/portfolio/home/home_oracle_improv.png"
            alt="Oracle-Improv"
          />
          <div className="homeHero__shade" />
        </div>

        <div className="homeHero__content">
          <h1 className="homeHero__title">{t.heroTitle}</h1>
          <p className="homeHero__text">{t.heroText}</p>

          <div className="homeHero__actions">
            <Link className="homeBtn homeBtn--primary" to="/work">
              {t.heroPrimary}
            </Link>
            <Link className="homeBtn homeBtn--soft" to="/app">
              {t.heroSecondary}
            </Link>
          </div>
        </div>
      </section>

      <NetflixRow title={t.mainRow} items={mainItems} />
      <NetflixRow title={t.secondRow} items={secondaryItems} />
    </main>
  );
}
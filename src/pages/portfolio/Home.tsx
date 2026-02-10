// src/pages/portfolio/Home.tsx
import { Link } from "react-router-dom";
import "./Home.css";
import { useAppSettings } from "../../state/appSettings";

export default function Home() {
  const { st } = useAppSettings();
  const lang = st.lang; // "es" | "en"

  // ✅ Imágenes en public (rutas absolutas)
  const heroSlides = [
    {
      slug: "oraculo-improv",
      img: "/media/portfolio/home/home_oracle_improv.png",
      title: { es: "Oracle-Improv", en: "Oracle-Improv" },
      tag: { es: "IA + impro + feedback", en: "AI + improv + feedback" },
    },
    {
      slug: "cotilleos-del-olimpo",
      img: "/media/portfolio/home/home_cotilleos.png",
      title: { es: "Cotilleos del Olimpo", en: "Olympos Gossip" },
      tag: { es: "Capítulo piloto", en: "Pilot episode" },
    },
    {
      slug: "rv-monta-tu-teatro",
      img: "/media/portfolio/home/home_rv.png",
      title: { es: "RV: Monta tu Teatro", en: "VR: Build Your Theatre" },
      tag: { es: "Unreal Engine 5", en: "Unreal Engine 5" },
    },
  ];

  const t =
    lang === "es"
      ? {
          h1: "Portfolio",
          sub: "Arte, tecnología y escena. Proyectos que se construyen como mundos.",
          ctaWork: "Ver proyectos",
          ctaApp: "Abrir la app",
        }
      : {
          h1: "Portfolio",
          sub: "Art, technology and stage. Projects built like worlds.",
          ctaWork: "View work",
          ctaApp: "Open the app",
        };

  return (
    <main className="pHome">
      <header className="pHome__hero">
        <h1 className="pHome__title">{t.h1}</h1>
        <p className="pHome__subtitle">{t.sub}</p>

        <div className="pHome__ctaRow">
          <Link className="pHome__btn pHome__btn--accent" to="/work">
            {t.ctaWork}
          </Link>
          <Link className="pHome__btn pHome__btn--soft" to="/app">
            {t.ctaApp}
          </Link>
        </div>
      </header>

      {/* ✅ Carrusel simple 16:9 (sin cortar imagen: object-fit: contain en CSS) */}
      <section className="pHome__carousel" aria-label="Featured projects">
        <div className="pCar">
          {heroSlides.map((s) => (
            <Link key={s.slug} to={`/work/${s.slug}`} className="pCar__slide">
              <div className="pCar__frame" aria-hidden>
                <img src={s.img} alt={s.title[lang]} loading="lazy" />
              </div>

              <div className="pCar__cap">
                <div className="pCar__name">{s.title[lang]}</div>
                <div className="pCar__tag">{s.tag[lang]}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

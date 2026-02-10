// src/pages/portfolio/CV.tsx
import { useEffect } from "react";
import "./cv.css";
import { useAppSettings } from "../../state/appSettings";

const LINKEDIN_URL =
  "https://www.linkedin.com/in/sara-noriega-rodr%C3%ADguez-909221177";

export default function CV() {
  const { st } = useAppSettings();
  const lang = (st.lang ?? "es") as "es" | "en";

  // ✅ Mantén <html lang="..."> sincronizado con appSettings
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t =
    lang === "es"
      ? {
          back: "Volver",
          print: "Imprimir / Guardar PDF",
          title: "Sara Noriega Rodríguez",
          role: "Narrativa · Experiencias inmersivas · Desarrollo creativo-tecnológico",
          summaryTitle: "Resumen",
          summary:
            "Perfil híbrido entre teatro, narrativa y tecnología. Diseño y construyo experiencias interactivas con foco en claridad, emoción y estructura. Me muevo cómoda entre prototipo, producto y puesta en escena.",
          highlightsTitle: "Fortalezas",
          h1: "Dirección y narrativa",
          h2: "UX / Producto",
          h3: "Tecnología creativa",
          expTitle: "Experiencia / Proyectos",
          exp1Title: "Oráculo-Improv (App)",
          exp1Body:
            "Plataforma de entrenamiento de improvisación teatral con personajes y un Oráculo evaluador. Arquitectura React/TS + backend Node/Express; foco en UX, feedback y progresión.",
          exp2Title: "RV · Monta tu Teatro",
          exp2Body:
            "Experiencia inmersiva (UE5/VR). Investigación y prototipado en curso. Exploración de lenguaje escénico y sistemas interactivos.",
          eduTitle: "Formación",
          eduBody:
            "Formación internacional y proyectos creativos. (Añadiré títulos/fechas exactas cuando lo tengas listo.)",
          linksTitle: "Enlaces",
          linkedin: "LinkedIn",
          note:
            "Tip: al imprimir, el diseño está optimizado para PDF A4. Si quieres versión 1 página o ATS, te la preparo.",
          emailLabel: "Email",
          locationLabel: "Ubicación",
        }
      : {
          back: "Back",
          print: "Print / Save PDF",
          title: "Sara Noriega Rodríguez",
          role: "Narrative · Immersive experiences · Creative-tech development",
          summaryTitle: "Summary",
          summary:
            "Hybrid profile bridging theatre, narrative and technology. I design and build interactive experiences with a focus on clarity, emotion and structure. Comfortable moving from prototype to product to stage language.",
          highlightsTitle: "Strengths",
          h1: "Direction & narrative",
          h2: "UX / Product",
          h3: "Creative technology",
          expTitle: "Experience / Projects",
          exp1Title: "Oracle-Improv (App)",
          exp1Body:
            "Improv training platform with characters plus an evaluator Oracle. React/TS + Node/Express architecture; strong focus on UX, feedback and progression.",
          exp2Title: "VR · Build Your Theatre",
          exp2Body:
            "Immersive experience (UE5/VR). Research and prototyping in progress. Exploring stage language through interactive systems.",
          eduTitle: "Education",
          eduBody:
            "International education and creative projects. (Add exact degrees/dates when you’re ready.)",
          linksTitle: "Links",
          linkedin: "LinkedIn",
          note:
            "Tip: print layout is optimized for A4 PDF. If you want a one-page or ATS version, I can craft it.",
          emailLabel: "Email",
          locationLabel: "Location",
        };

  function onPrint() {
    window.print();
  }

  return (
    <main className="cvPage">
      <header className="cvTop">
        <div className="cvTop__left">
          <a className="cvBack" href="/">
            ← {t.back}
          </a>
        </div>

        <div className="cvTop__right">
          <button className="cvBtn" onClick={onPrint}>
            {t.print}
          </button>
        </div>
      </header>

      <section className="cvSheet" role="document" aria-label="CV">
        <div className="cvHeader">
          <div>
            <h1 className="cvName">{t.title}</h1>
            <div className="cvRole">{t.role}</div>
          </div>

          <div className="cvMini">
            <div className="cvMini__line">
              <span className="cvMini__k">LinkedIn</span>
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                sara-noriega-rodríguez
              </a>
            </div>

            {/* 🔧 rellena esto cuando quieras */}
            <div className="cvMini__line">
              <span className="cvMini__k">{t.emailLabel}</span>
              <span>sara.noriega.rodriguez@gmail.com</span>
            </div>

            <div className="cvMini__line">
              <span className="cvMini__k">{t.locationLabel}</span>
              <span>Spain</span>
            </div>
          </div>
        </div>

        <div className="cvGrid">
          <section className="cvBlock">
            <h2 className="cvH2">{t.summaryTitle}</h2>
            <p className="cvP">{t.summary}</p>

            <h2 className="cvH2">{t.highlightsTitle}</h2>
            <ul className="cvList">
              <li>{t.h1}</li>
              <li>{t.h2}</li>
              <li>{t.h3}</li>
            </ul>
          </section>

          <section className="cvBlock">
            <h2 className="cvH2">{t.expTitle}</h2>

            <div className="cvItem">
              <div className="cvItem__title">{t.exp1Title}</div>
              <div className="cvItem__body">{t.exp1Body}</div>
            </div>

            <div className="cvItem">
              <div className="cvItem__title">{t.exp2Title}</div>
              <div className="cvItem__body">{t.exp2Body}</div>
              <span className="cvTag">Coming soon</span>
            </div>

            <h2 className="cvH2">{t.eduTitle}</h2>
            <div className="cvItem">
              <div className="cvItem__body">{t.eduBody}</div>
            </div>

            <h2 className="cvH2">{t.linksTitle}</h2>
            <div className="cvLinks">
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                {t.linkedin}
              </a>
            </div>

            <p className="cvNote">{t.note}</p>
          </section>
        </div>
      </section>
    </main>
  );
}

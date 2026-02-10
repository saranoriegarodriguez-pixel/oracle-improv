// src/pages/portfolio/About.tsx
import { useEffect } from "react";
import "./About.css";
import { useAppSettings } from "../../state/appSettings";

const LINKEDIN_URL =
  "https://www.linkedin.com/in/sara-noriega-rodr%C3%ADguez-909221177";

const PORTRAIT_IMG = "/media/portfolio/about/about-sara.png";
// ✅ Asegúrate de que exista aquí:
// public/media/portfolio/about/about-sara.png

export default function About() {
  const { st } = useAppSettings();
  const lang = (st.lang ?? "es") as "es" | "en";

  // ✅ sincroniza <html lang="..."> con appSettings
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t =
    lang === "es"
      ? {
          title: "Sobre mí",
          lead:
            "He aprendido a construir con calma en medio del ruido. Mi camino mezcla escena, tecnología y una obsesión paciente por mejorar lo que otros dan por terminado.",
          body1:
            "Trabajo entre lo creativo y lo técnico: donde una idea necesita forma, estructura y un poco de valentía. Me interesa el diseño de experiencias, la narrativa interactiva y la ingeniería que no mata la emoción.",
          body2:
            "No busco atajos: prefiero sistemas que resisten el tiempo. Proyectos que tienen pulso. Y decisiones que, aunque no se expliquen del todo, se sienten correctas.",
          ctaCV: "Ver CV (PDF pro)",
          ctaLinkedin: "LinkedIn",
          altPortrait: "Retrato",
        }
      : {
          title: "About me",
          lead:
            "I’ve learned to build calmly inside the noise. My path blends stage, technology, and a patient obsession with improving what others consider finished.",
          body1:
            "I work between the creative and the technical: where an idea needs form, structure, and a bit of courage. I care about experience design, interactive narrative, and engineering that doesn’t kill emotion.",
          body2:
            "I don’t chase shortcuts. I prefer systems that endure. Projects that have a pulse. And decisions that, even when not fully explained, feel unmistakably right.",
          ctaCV: "Open CV (PDF pro)",
          ctaLinkedin: "LinkedIn",
          altPortrait: "Portrait",
        };

  return (
    <main className="pfPage">
      <section className="pfAbout">
        <div className="pfAbout__left">
          <h1 className="pfH1">{t.title}</h1>

          <p className="pfLead">{t.lead}</p>
          <p className="pfP">{t.body1}</p>
          <p className="pfP">{t.body2}</p>

          <div className="pfAbout__actions">
            <a className="pfBtn pfBtn--primary" href="/cv">
              {t.ctaCV}
            </a>

            <a
              className="pfBtn pfBtn--ghost"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
            >
              {t.ctaLinkedin}
            </a>
          </div>
        </div>

        <div className="pfAbout__right">
          <div className="pfPortrait">
            <img
              src={PORTRAIT_IMG}
              alt={t.altPortrait}
              className="pfPortrait__img"
              loading="lazy"
            />
            <div className="pfPortrait__glow" aria-hidden />
          </div>
        </div>
      </section>
    </main>
  );
}

// src/pages/portfolio/About.tsx
import { useLang } from "./lang";

export default function About() {
  const lang = useLang();

  return (
    <div className="portfolioPage">
      <h1>{lang === "es" ? "Sobre mí" : "About"}</h1>
      <p>
        {lang === "es"
          ? "Página About del portfolio. Aquí va tu historia, enfoque y stack."
          : "Portfolio About page. Your story, approach, and stack go here."}
      </p>
    </div>
  );
}

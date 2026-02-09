// src/pages/portfolio/Contact.tsx
import { useLang } from "./lang";

export default function Contact() {
  const lang = useLang();

  return (
    <div className="portfolioPage">
      <h1>{lang === "es" ? "Contacto" : "Contact"}</h1>
      <p>
        {lang === "es"
          ? "Pon aquí email, redes y un CTA limpio."
          : "Put your email, socials, and a clean CTA here."}
      </p>
    </div>
  );
}

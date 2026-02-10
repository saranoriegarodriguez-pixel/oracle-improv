// src/pages/portfolio/Contact.tsx
import { useEffect, useMemo, useState } from "react";
import "./Contact.css";
import { useAppSettings } from "../../state/appSettings";

const LINKEDIN_URL =
  "https://www.linkedin.com/in/sara-noriega-rodr%C3%ADguez-909221177?utm_source=share_via&utm_content=profile&utm_medium=member_ios";

// 🔧 cambia por tu email real (ya lo tienes bien)
const EMAIL = "sara.noriega.rodriguez@gmail.com";

/**
 * ✅ IMPORTANTE: como acordamos, TODO va en public.
 * Tu estructura recomendada es:
 * public/media/portfolio/contact/threshold-door.png
 *
 * Por tanto la ruta correcta es:
 */
const HERO_IMG = "/media/portfolio/contact/threshold-door.png";

export default function Contact() {
  const { st } = useAppSettings();
  const lang = (st.lang ?? "es") as "es" | "en";

  // ✅ sincroniza <html lang="..."> con appSettings
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t =
    lang === "es"
      ? {
          title: "Cruza el umbral",
          lead1: "Si has llegado hasta aquí, probablemente tengas algo en mente.",
          lead2: "Las buenas ideas empiezan con una conversación.",
          channels: "Canales",
          start: "Iniciar conversación",
          name: "Nombre",
          email: "Email",
          message: "Mensaje",
          placeholderName: "Tu nombre",
          placeholderEmail: "tu@email.com",
          placeholderMsg: "Cuéntame por qué has cruzado el umbral…",
          send: "Enviar mensaje",
          preferLinkedin: "Prefiero LinkedIn",
          paragraph:
            "Puedes escribirme para proyectos creativos, desarrollo, docencia, charlas o colaboraciones híbridas entre arte y tecnología.",
          ruleStrong: "No respondo a propuestas genéricas o automatizadas.",
          ruleSoft: "Si escribes, cuéntame por qué.",
          hintNoEmail:
            "El formulario genera un mailto. Si prefieres envío real, lo conectamos a backend más adelante.",
          hintSetEmail: "(Añade tu email en Contact.tsx para activar el botón)",
        }
      : {
          title: "Cross the threshold",
          lead1: "If you made it here, you probably have something in mind.",
          lead2: "Good ideas start with a conversation.",
          channels: "Channels",
          start: "Start a conversation",
          name: "Name",
          email: "Email",
          message: "Message",
          placeholderName: "Your name",
          placeholderEmail: "you@email.com",
          placeholderMsg: "Tell me why you crossed the threshold…",
          send: "Send message",
          preferLinkedin: "I prefer LinkedIn",
          paragraph:
            "You can write to me for creative projects, development, teaching, talks, or hybrid collaborations between art and technology.",
          ruleStrong: "I don’t reply to generic or automated proposals.",
          ruleSoft: "If you write, tell me why.",
          hintNoEmail:
            "The form generates a mailto. If you want real sending, we’ll wire it to a backend later.",
          hintSetEmail: "(Add your email in Contact.tsx to enable the button)",
        };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const mailto = useMemo(() => {
    if (!EMAIL) return "";

    const subject = encodeURIComponent(t.title);

    const body =
      lang === "es"
        ? encodeURIComponent(
            `Hola Sara,\n\nSoy ${name || "[tu nombre]"}.\n\nMotivo:\n${
              msg || "[cuéntame por qué]"
            }\n\nContacto: ${email || "[tu email]"}\n`
          )
        : encodeURIComponent(
            `Hi Sara,\n\nI'm ${name || "[your name]"}.\n\nReason:\n${
              msg || "[tell me why]"
            }\n\nContact: ${email || "[your email]"}\n`
          );

    return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  }, [name, email, msg, t.title, lang]);

  return (
    <main className="contact">
      <section className="contactHero" aria-label="Contact image">
        <div className="contactHero__frame">
          {/* ✅ Imagen desde public */}
          <img
            className="contactHero__img"
            src={HERO_IMG}
            alt={lang === "es" ? "Umbral" : "Threshold"}
            loading="lazy"
          />
        </div>
      </section>

      <section className="contactBody">
        <header className="contactHeader">
          <h1 className="contactTitle">{t.title}</h1>

          <p className="contactLead">
            {t.lead1}
            <br />
            {t.lead2}
          </p>
        </header>

        <div className="contactGrid">
          {/* Canales */}
          <aside className="contactCard">
            <h2 className="contactCard__title">{t.channels}</h2>

            <div className="contactActions">
              {EMAIL ? (
                <a className="btn btn--primary" href={`mailto:${EMAIL}`}>
                  Email
                </a>
              ) : (
                <div className="hint">{t.hintSetEmail}</div>
              )}

              <a className="btn btn--soft" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>

            <p className="contactText">{t.paragraph}</p>

            <div className="contactRule">
              <strong>{t.ruleStrong}</strong>
              <div>{t.ruleSoft}</div>
            </div>
          </aside>

          {/* Formulario */}
          <section className="contactCard">
            <h2 className="contactCard__title">{t.start}</h2>

            <form
              className="contactForm"
              onSubmit={(e) => {
                e.preventDefault();
                if (!EMAIL) return;
                window.location.href = mailto;
              }}
            >
              <label className="field">
                <span className="field__label">{t.name}</span>
                <input
                  className="field__input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.placeholderName}
                  autoComplete="name"
                />
              </label>

              <label className="field">
                <span className="field__label">{t.email}</span>
                <input
                  className="field__input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholderEmail}
                  autoComplete="email"
                />
              </label>

              <label className="field">
                <span className="field__label">{t.message}</span>
                <textarea
                  className="field__textarea"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder={t.placeholderMsg}
                  rows={6}
                />
              </label>

              <div className="contactForm__actions">
                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={!EMAIL}
                  title={!EMAIL ? "Configura EMAIL para enviar" : "Enviar"}
                >
                  {t.send}
                </button>

                <a className="btn btn--ghost" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                  {t.preferLinkedin}
                </a>
              </div>

              {!EMAIL && <div className="hint">{t.hintNoEmail}</div>}
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

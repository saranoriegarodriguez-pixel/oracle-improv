// src/pages/CaseStudyGeneric.tsx
import { Link, useParams } from "react-router-dom";

export default function CaseStudyGeneric() {
  const { slug } = useParams();

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Proyecto</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Slug: <code>{slug}</code>
      </p>

      <p style={{ opacity: 0.85, lineHeight: 1.5 }}>
        Aquí podrás poner descripción, imágenes, vídeos, stack y links.
        Este template te permite añadir proyectos nuevos sin tocar el router.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <Link to="/work">← Volver a proyectos</Link>
        <Link to="/">Inicio</Link>
      </div>
    </div>
  );
}

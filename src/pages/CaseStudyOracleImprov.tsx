// src/pages/CaseStudyOracleImprov.tsx
import { Link } from "react-router-dom";

export default function CaseStudyOracleImprov() {
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Oráculo-Improv</h1>
      <p style={{ opacity: 0.8 }}>
        Aquí pondrás: qué es, qué problema resuelve, screenshots, stack y decisiones.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <Link to="/app" style={{ padding: "10px 14px", border: "1px solid rgba(255,255,255,.16)", borderRadius: 12 }}>
          Probar la app →
        </Link>
        <Link to="/work" style={{ padding: "10px 14px", border: "1px solid rgba(255,255,255,.16)", borderRadius: 12 }}>
          Ver todos los proyectos →
        </Link>
      </div>
    </div>
  );
}

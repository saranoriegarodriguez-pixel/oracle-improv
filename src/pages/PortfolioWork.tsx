// src/pages/PortfolioWork.tsx
import { Link } from "react-router-dom";

export default function PortfolioWork() {
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Proyectos</h1>

      <div style={{ marginTop: 14 }}>
        <Link to="/work/oraculo-improv">
          Oráculo-Improv (case study) →
        </Link>
      </div>

      <div style={{ marginTop: 18 }}>
        <Link to="/">← Volver</Link>
      </div>
    </div>
  );
}

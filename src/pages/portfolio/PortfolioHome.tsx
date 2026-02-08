// src/pages/PortfolioHome.tsx
import { Link } from "react-router-dom";

export default function PortfolioHome() {
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Portfolio</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Aquí irá tu landing. De momento: accesos rápidos.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
        <Link to="/app" style={{ padding: "10px 14px", border: "1px solid rgba(255,255,255,.16)", borderRadius: 12 }}>
          Probar Oráculo-Improv →
        </Link>

        <Link to="/work" style={{ padding: "10px 14px", border: "1px solid rgba(255,255,255,.16)", borderRadius: 12 }}>
          Ver proyectos →
        </Link>
      </div>
    </div>
  );
}

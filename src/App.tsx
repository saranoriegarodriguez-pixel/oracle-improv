// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Portfolio
import PortfolioHome from "./pages/PortfolioHome";
import PortfolioWork from "./pages/PortfolioWork";
import CaseStudyOracleImprov from "./pages/CaseStudyOracleImprov";

// ✅ (futuro) Case study genérico para nuevos proyectos
// Si todavía no lo has creado, créalo como archivo (te dejo abajo el contenido).
import CaseStudyGeneric from "./pages/CaseStudyGeneric";

// App real
import AppShell from "./pages/AppShell";

export default function App() {
  return (
    <Routes>
      {/* =========================
          PORTFOLIO
      ========================== */}
      <Route path="/" element={<PortfolioHome />} />

      {/* Listado de proyectos */}
      <Route path="/work" element={<PortfolioWork />} />

      {/* Case study principal (fijo, bonito) */}
      <Route path="/work/oraculo-improv" element={<CaseStudyOracleImprov />} />

      {/* ✅ FUTURO: cualquier otro proyecto sin tocar el router
          Ejemplos:
          /work/videojuego-god
          /work/unreal-jam-7days
          /work/mil-ideas
      */}
      <Route path="/work/:slug" element={<CaseStudyGeneric />} />

      {/* =========================
          APP REAL
      ========================== */}
      <Route path="/app/*" element={<AppShell />} />

      {/* =========================
          FALLBACK
      ========================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

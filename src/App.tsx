import { Routes, Route, Navigate } from "react-router-dom";

// APP
import AppShell from "./pages/app/AppShell";
import Home from "./pages/app/Home";
import Scene from "./pages/app/Scene";
import Session from "./pages/app/Session";
import Profile from "./pages/app/Profile";
import Settings from "./pages/app/Settings";

// PORTFOLIO
import PortfolioLayout from "./pages/portfolio/PortfolioLayout";
import PortfolioHome from "./pages/portfolio/PortfolioHome";
import PortfolioWork from "./pages/portfolio/PortfolioWork";
import About from "./pages/portfolio/About";
import Contact from "./pages/portfolio/Contact";
import CaseStudyOracleImprov from "./pages/portfolio/CaseStudyOracleImprov";
import CaseStudyGeneric from "./pages/portfolio/CaseStudyGeneric";

export default function App() {
  return (
    <Routes>
      {/* ✅ APP siempre en /app */}
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="/app/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="scene" element={<Scene />} />
        <Route path="session" element={<Session />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* ✅ PORTFOLIO bilingüe */}
      <Route path="/:lang(es|en)" element={<PortfolioLayout />}>
        <Route index element={<PortfolioHome />} />
        <Route path="work" element={<PortfolioWork />} />
        <Route path="work/:slug" element={<CaseStudyGeneric />} />
        <Route path="work/oraculo-improv" element={<CaseStudyOracleImprov />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* ✅ entrypoints */}
      <Route path="/" element={<Navigate to="/es" replace />} />
      <Route path="*" element={<Navigate to="/es" replace />} />
    </Routes>
  );
}

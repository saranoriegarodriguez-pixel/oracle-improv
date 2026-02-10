// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

// Portfolio (web)
import Home from "./pages/portfolio/Home";
import Work from "./pages/portfolio/Work";
import About from "./pages/portfolio/About";
import Contact from "./pages/portfolio/Contact";
import CV from "./pages/portfolio/CV";
import ProjectPage from "./pages/portfolio/ProjectPage";

// App (tu app interna)
import AppShell from "./pages/app/AppShell";

export default function App() {
  return (
    <Routes>
      {/* ✅ WEB / PORTFOLIO */}
      <Route path="/" element={<Home />} />

      {/* Work: lista + detalle */}
      <Route path="/work" element={<Work />} />
      <Route path="/work/:slug" element={<ProjectPage />} />

      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cv" element={<CV />} />

      {/* ✅ APP */}
      <Route path="/app/*" element={<AppShell />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

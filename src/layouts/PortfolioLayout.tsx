// src/layouts/PortfolioLayout.tsx
import { Routes, Route } from "react-router-dom";
import Topbar from "../components/Topbar";

// Portfolio pages (ajusta si tus paths difieren)
import Home from "../pages/portfolio/Home";
import Work from "../pages/portfolio/Work";
import About from "../pages/portfolio/About";
import Contact from "../pages/portfolio/Contact";
import CV from "../pages/portfolio/CV";
import ProjectPage from "../pages/portfolio/ProjectPage";

export default function PortfolioLayout() {
  return (
    <>
      <Topbar mode="portfolio" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/:slug" element={<ProjectPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cv" element={<CV />} />
      </Routes>
    </>
  );
}

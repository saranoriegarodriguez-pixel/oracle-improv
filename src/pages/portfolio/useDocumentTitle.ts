// src/pages/portfolio/useDocumentTitle.ts
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useDocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isEn = pathname.startsWith("/en");
    const lang = isEn ? "en" : "es";

    // sección = primer segmento después de /es o /en
    const section =
      pathname
        .replace(/^\/(es|en)/, "")
        .split("/")[1] ?? "";

    const titles: Record<string, { es: string; en: string }> = {
      "": { es: "Portfolio · Sara Atelier", en: "Portfolio · Sara Atelier" },
      work: { es: "Proyectos · Sara Atelier", en: "Work · Sara Atelier" },
      about: { es: "Sobre mí · Sara Atelier", en: "About · Sara Atelier" },
      contact: { es: "Contacto · Sara Atelier", en: "Contact · Sara Atelier" },

      // caso study /work/:slug
      // aquí dejamos genérico (si quieres, lo hacemos dinámico con PROJECTS)
      "work-detail": { es: "Proyecto · Sara Atelier", en: "Project · Sara Atelier" },
    };

    // si estás en /work/loquesea
    const isWorkDetail =
      section === "work" && pathname.replace(/^\/(es|en)\//, "").split("/").length >= 2;

    const key = isWorkDetail ? "work-detail" : section;

    const title =
      titles[key]?.[lang] ??
      (lang === "es" ? "Sara Atelier · Portfolio" : "Sara Atelier · Portfolio");

    document.title = title;
  }, [pathname]);
}

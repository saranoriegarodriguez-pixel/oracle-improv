// src/pages/portfolio/lang.ts
import { useLocation, useParams } from "react-router-dom";

export type PortfolioLang = "es" | "en";

export function normalizeLang(x: unknown): PortfolioLang {
  return x === "en" ? "en" : "es";
}

/**
 * Hook: idioma actual desde la URL /:lang
 */
export function useLang(): PortfolioLang {
  const params = useParams();
  return normalizeLang(params.lang);
}

/**
 * Prefija una ruta con el idioma:
 * withLang("es", "/work") -> "/es/work"
 * withLang("en", "about") -> "/en/about"
 */
export function withLang(lang: PortfolioLang, path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${p}`;
}

/**
 * Cambia solo el idioma manteniendo el resto del path.
 * /es/work/oraculo-improv -> /en/work/oraculo-improv
 * /en/about -> /es/about
 */
export function useSwitchLangPath() {
  const location = useLocation();
  const params = useParams();

  const current = normalizeLang(params.lang);
  const rest = location.pathname.replace(/^\/(es|en)(\/|$)/, "/"); // deja "/" + lo demás

  return (next: PortfolioLang) => {
    if (next === current) return location.pathname + location.search + location.hash;
    const cleanRest = rest.startsWith("/") ? rest : `/${rest}`;
    return `/${next}${cleanRest}${location.search}${location.hash}`;
  };
}

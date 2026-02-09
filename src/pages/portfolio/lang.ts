// src/pages/portfolio/lang.ts
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export type Lang = "es" | "en";

/* =========================
   Utils puros
========================= */

export function getLangFromPath(pathname: string): Lang {
  return pathname.startsWith("/en") ? "en" : "es";
}

export function withLang(lang: Lang, path: string): string {
  if (path.startsWith("/es") || path.startsWith("/en")) return path;
  return `/${lang}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function switchLangPath(pathname: string, next: Lang): string {
  const clean = pathname.replace(/^\/(es|en)/, "");
  return `/${next}${clean || ""}`;
}

/* =========================
   Hooks (portfolio ONLY)
========================= */

export function useLang(): Lang {
  const loc = useLocation();
  return getLangFromPath(loc.pathname);
}

export function useSwitchLangPath() {
  const loc = useLocation();
  return (next: Lang) => switchLangPath(loc.pathname, next);
}

/**
 * Sincroniza <html lang="..."> con el idioma actual del portfolio.
 * Útil para SEO/accesibilidad.
 */
export function useHtmlLang() {
  const lang = useLang();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}

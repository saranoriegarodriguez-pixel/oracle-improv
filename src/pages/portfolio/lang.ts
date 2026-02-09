// src/pages/portfolio/lang.ts
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export type Lang = "es" | "en";

/** Lee idioma real desde la URL: /en... => en, si no => es */
export function useLang(): Lang {
  const { pathname } = useLocation();
  return pathname.startsWith("/en") ? "en" : "es";
}

/**
 * Prefixa una ruta con el idioma, evitando duplicados:
 * withLang("es", "/work") => "/es/work"
 * withLang("en", "/es/work") => "/en/work"
 * withLang("es", "/") => "/es"
 */
export function withLang(lang: Lang, path: string): string {
  const p = (path || "/").startsWith("/") ? path : `/${path}`;
  const rest = p.replace(/^\/(es|en)(\/|$)/, "/");
  const cleanRest = rest === "/" ? "" : rest;
  return `/${lang}${cleanRest}`;
}

/** Cambia idioma manteniendo la misma ruta del portfolio (/es/... <-> /en/...) */
export function useSwitchLangPath() {
  const { pathname, search, hash } = useLocation();

  return (nextLang: Lang) => {
    const rest = pathname.replace(/^\/(es|en)(\/|$)/, "/");
    const cleanRest = rest === "/" ? "" : rest;
    return `/${nextLang}${cleanRest}${search ?? ""}${hash ?? ""}`;
  };
}

/** Mantiene <html lang="..."> sincronizado con la ruta actual del portfolio */
export function useHtmlLang() {
  const lang = useLang();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}

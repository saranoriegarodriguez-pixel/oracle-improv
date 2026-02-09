// src/pages/portfolio/lang.ts
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export type Lang = "es" | "en";
export const LANGS: Lang[] = ["es", "en"];

export function getPortfolioLang(pathname: string): Lang | null {
  const m = pathname.match(/^\/(es|en)(\/|$)/);
  return (m?.[1] as Lang) ?? null;
}

export function stripLangPrefix(pathname: string): string {
  const lang = getPortfolioLang(pathname);
  if (!lang) return pathname;

  const rest = pathname.replace(new RegExp(`^\\/${lang}`), "");
  return rest === "" ? "" : rest;
}

export function withLang(lang: Lang, pathAfterLang: string): string {
  const base = `/${lang}`;

  if (!pathAfterLang) return base;

  const rest = pathAfterLang.startsWith("/") ? pathAfterLang : `/${pathAfterLang}`;
  return `${base}${rest}`;
}

export function switchLangPath(pathname: string, nextLang: Lang): string {
  const current = getPortfolioLang(pathname);
  if (!current) return `/${nextLang}`;

  const rest = stripLangPrefix(pathname);
  return withLang(nextLang, rest);
}

/** Hook: idioma ACTUAL del portfolio (sale de la URL). */
export function useLang(): Lang {
  const loc = useLocation();
  return getPortfolioLang(loc.pathname) ?? "es";
}

/** Hook: construye la ruta equivalente al cambiar idioma manteniendo el resto. */
export function useSwitchLangPath() {
  const loc = useLocation();
  return (next: Lang) => switchLangPath(loc.pathname, next);
}

/** Hook: sincroniza <html lang="..."> con el idioma del portfolio. */
export function useHtmlLang() {
  const lang = useLang();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}

import { useLocation } from "react-router-dom";

export type Lang = "es" | "en";

/**
 * Devuelve el idioma actual según la URL.
 * /es/... → es
 * /en/... → en
 * default → es
 */
export function useLang(): Lang {
  const { pathname } = useLocation();
  return pathname.startsWith("/en") ? "en" : "es";
}

/**
 * Prependa el idioma a una ruta.
 * withLang("es", "/work") → /es/work
 * withLang("en", "/contact") → /en/contact
 */
export function withLang(lang: Lang, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${clean}`;
}

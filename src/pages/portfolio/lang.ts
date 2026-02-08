import { useParams } from "react-router-dom";
export type Lang = "es" | "en";

export function useLang(): Lang {
  const p = useParams();
  return p.lang === "en" ? "en" : "es";
}

export function withLang(lang: Lang, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${clean}`;
}

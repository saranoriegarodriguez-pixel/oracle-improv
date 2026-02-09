import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useHtmlLang() {
  const { pathname } = useLocation();

  useEffect(() => {
    const lang =
      pathname.startsWith("/en") ? "en"
      : pathname.startsWith("/es") ? "es"
      : "es"; // fallback seguro

    document.documentElement.lang = lang;
  }, [pathname]);
}

// src/pages/auth/RequireAuth.tsx
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../state/authStore";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuthStore();
  const loc = useLocation();

  useEffect(() => {
    // 1 sola llamada al montar
    if (auth.status === "unknown") {
      void auth.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mientras no sepamos nada: loading
  if (auth.status === "unknown" || auth.status === "loading") {
    return <div style={{ padding: 20, opacity: 0.85 }}>Cargando sesión…</div>;
  }

  // Si no hay sesión: manda a /login con next relativo (React Router)
  if (auth.status !== "authed") {
    const next = loc.pathname + loc.search + loc.hash;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  // OK
  return <>{children}</>;
}
// src/pages/auth/RequireAuth.tsx
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../state/authStore";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuthStore();
  const loc = useLocation();

  useEffect(() => {
    if (auth.status === "unknown") {
      void auth.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (auth.status === "unknown" || auth.status === "loading") {
    return <div style={{ padding: 20, opacity: 0.85 }}>Cargando sesión…</div>;
  }

  if (auth.status !== "authed") {
    const next = loc.pathname + loc.search;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return <>{children}</>;
}

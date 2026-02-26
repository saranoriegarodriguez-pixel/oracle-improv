import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../state/authStore";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status, refresh } = useAuthStore();
  const loc = useLocation();

  useEffect(() => {
    // 👇 Importantísimo: solo si aún no sabemos
    if (status === "unknown") {
      void refresh();
    }
  }, [status, refresh]);

  // ✅ Mientras comprobamos sesión: NO redirigir
  if (status === "unknown" || status === "loading") {
    return <div style={{ padding: 24 }}>Cargando sesión…</div>;
  }

  // ✅ Si ya sabemos que no hay sesión, entonces sí
  if (status === "anon") {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // ✅ Authed
  return <>{children}</>;
}
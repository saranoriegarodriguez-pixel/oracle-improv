// src/pages/auth/RequireAuth.tsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../state/authStore";

type Props = { children: React.ReactNode };

export default function RequireAuth({ children }: Props) {
  const loc = useLocation();
  const auth = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // Si ya está authed, listo
        if (auth.status === "authed") {
          if (alive) setChecked(true);
          return;
        }

        await auth.refresh();
        if (alive) setChecked(true);
      } catch {
        if (alive) setChecked(true);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loader mínimo
  if (!checked || auth.status === "unknown" || auth.status === "loading") return null;

  if (auth.status !== "authed") {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <>{children}</>;
}

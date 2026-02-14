// src/pages/auth/Login.tsx
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../state/authStore";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const auth = useAuthStore();

  const [loading, setLoading] = useState(false);
  const next = useMemo(() => params.get("next") || "/app", [params]);

  async function startGoogle() {
    setLoading(true);
    try {
      const r = await fetch(`/api/auth/google/start?next=${encodeURIComponent(next)}`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error(await r.text());
      const data = (await r.json()) as { url: string };
      window.location.href = data.url;
    } catch {
      setLoading(false);
      alert("No se pudo iniciar Google Login.");
    }
  }

  async function checkMe() {
    setLoading(true);
    await auth.refresh();
    setLoading(false);

    if (auth.status === "authed") {
      navigate(next, { replace: true });
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h2>Iniciar sesión</h2>
      <p style={{ opacity: 0.85 }}>
        Google crea una cookie de sesión (sid). La usamos para habilitar OpenAI y contar límites diarios.
      </p>

      <button
        type="button"
        onClick={startGoogle}
        disabled={loading}
        style={{ padding: "10px 14px", marginTop: 10 }}
      >
        {loading ? "Abriendo Google…" : "Continuar con Google"}
      </button>

      <div style={{ marginTop: 14, opacity: 0.8 }}>
        <button type="button" onClick={checkMe} disabled={loading}>
          Ya volví del callback, comprobar sesión
        </button>
      </div>
    </div>
  );
}

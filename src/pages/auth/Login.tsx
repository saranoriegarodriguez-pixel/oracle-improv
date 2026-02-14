// src/pages/auth/Login.tsx
import { useSearchParams } from "react-router-dom";

export default function Login() {
  const [sp] = useSearchParams();
  const next = sp.get("next") || "/app";

  async function loginWithGoogle() {
    // Le pasamos next al backend para que lo guarde en "state"
    const r = await fetch(`/api/auth/google/start?next=${encodeURIComponent(next)}`, {
      credentials: "include",
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(txt || "Failed to start Google login");
    }

    const data = (await r.json()) as { url: string };
    window.location.href = data.url;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Login</h1>
      <p>Para entrar a la app interna, inicia sesión con Google.</p>

      <button onClick={() => void loginWithGoogle()}>
        Continuar con Google
      </button>
    </div>
  );
}

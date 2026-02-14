// src/pages/app/AppShell.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../../state/authStore";

export default function AppShell() {
  const auth = useAuthStore();

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header mínimo (si luego tienes Topbar real, lo sustituimos) */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 16 }}>
        <div style={{ fontWeight: 700 }}>🔮 App</div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {auth.user?.email && (
            <span style={{ opacity: 0.8, fontSize: 13 }}>{auth.user.email}</span>
          )}

          <button onClick={() => void auth.logout()}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Rutas internas (pon aquí tus páginas reales) */}
      <Routes>
        <Route path="/" element={<div style={{ padding: 16 }}>Home interna</div>} />
        {/* Ejemplos:
            <Route path="scene" element={<Scene />} />
            <Route path="session" element={<Session />} />
        */}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </div>
  );
}

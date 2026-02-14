// src/pages/app/AppShell.tsx
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../state/authStore";

import Topbar from "../../components/Topbar";

import Home from "./Home";
import Profile from "./Profile";
import Settings from "./Settings";
import Scene from "./Scene";
import Session from "./Session";

export default function AppShell() {
  const auth = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await auth.logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="appShell">
      {/* Topbar global */}
      <Topbar />

      {/* Barra interna de la app */}
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "12px 16px",
          alignItems: "center",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <strong style={{ opacity: 0.7 }}>/app</strong>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {auth.status === "authed" && (
            <>
              <span style={{ opacity: 0.85 }}>
                {auth.user?.name || auth.user?.email}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                🚪
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rutas internas de la app */}
      <div className="appShell__content">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/scene" element={<Scene />} />
          <Route path="/session" element={<Session />} />

          {/* Default → /app/home */}
          <Route path="*" element={<Navigate to="/app/home" replace />} />
        </Routes>
      </div>
    </div>
  );
}

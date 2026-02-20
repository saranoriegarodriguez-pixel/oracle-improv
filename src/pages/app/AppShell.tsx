// src/pages/app/AppShell.tsx
import { Routes, Route } from "react-router-dom";
import { FeedbackProvider } from "../../state/feedback/FeedbackProvider";

import Home from "./Home";
import Scene from "./Scene";
import Session from "./Session";
import Profile from "./Profile";
import Settings from "./Settings";

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>404</h2>
      <p>Ruta no encontrada.</p>
    </div>
  );
}

/**
 * AppShell está montado en App.tsx como:
 * <Route path="/app/*" element={<AppLayout />} />
 *
 * Y AppLayout renderiza <AppShell />.
 * Por eso aquí usamos rutas RELATIVAS: "scene", "session", etc.
 */
export default function AppShell() {
  return (
    <FeedbackProvider>
      <Routes>
        {/* ✅ /app */}
        <Route index element={<Home />} />

        {/* ✅ /app/scene */}
        <Route path="scene" element={<Scene />} />

        {/* ✅ /app/session */}
        <Route path="session" element={<Session />} />

        {/* ✅ /app/profile */}
        <Route path="profile" element={<Profile />} />

        {/* ✅ /app/settings */}
        <Route path="settings" element={<Settings />} />

        {/* ✅ fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </FeedbackProvider>
  );
}
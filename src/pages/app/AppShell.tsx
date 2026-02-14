// src/pages/app/AppShell.tsx
import { Routes, Route } from "react-router-dom";
import { FeedbackProvider } from "../../state/feedback/FeedbackProvider";

import Home from "./Home";
import Scene from "./Scene";
import Session from "./Session";
import Profile from "./Profile";
import Settings from "./Settings";

import Login from "../auth/Login";

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>404</h2>
      <p>Ruta no encontrada.</p>
    </div>
  );
}

/**
 * OJO:
 * Este AppShell está pensado para montarse en App.tsx como:
 * <Route path="/app/*" element={<AppShell />} />
 *
 * Por eso aquí usamos rutas RELATIVAS: "scene", "session", etc.
 */
export default function AppShell() {
  return (
    <FeedbackProvider>
      <Routes>
        <Route index element={<Home />} />
        <Route path="scene" element={<Scene />} />
        <Route path="session" element={<Session />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="login" element={<Login />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </FeedbackProvider>
  );
}

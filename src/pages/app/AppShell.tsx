// src/pages/AppShell.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./Home";
import Scene from "./Scene";
import Session from "./Session";
import Profile from "./Profile";
import Settings from "./Settings";

import { FeedbackProvider } from "../../state/feedback/FeedbackProvider";

export default function AppShell() {
  return (
    <FeedbackProvider>
      <Routes>
        {/* App real (dentro de /app/*) */}
        <Route path="/" element={<Home />} />
        <Route path="/scene" element={<Scene />} />
        <Route path="/session" element={<Session />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />

        {/* Si se meten en una ruta rara dentro de /app */}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </FeedbackProvider>
  );
}

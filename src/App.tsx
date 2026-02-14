// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import Login from "./pages/auth/Login";
import RequireAuth from "./pages/auth/RequireAuth";
import AppShell from "./pages/app/AppShell";

// tus páginas internas
import Scene from "./pages/Scene";
import Session from "./pages/session/Session"; // ajusta ruta real

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />

        {/* protegidas */}
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Scene />} />
          <Route path="session" element={<Session />} />
        </Route>

        {/* fallback simple */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

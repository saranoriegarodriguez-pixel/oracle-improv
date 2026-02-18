// src/App.tsx
import { Routes, Route } from "react-router-dom";

// Portfolio layout
import PortfolioLayout from "./layouts/PortfolioLayout";

// Auth
import Login from "./pages/auth/Login";
import RequireAuth from "./pages/auth/RequireAuth";

// App layout
import AppLayout from "./layouts/AppLayout";

export default function App() {
  return (
    <Routes>
      {/* 🔐 LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* 🔮 APP PRIVADA */}
      <Route
        path="/app/*"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      />

      {/* 🎪 PORTFOLIO */}
      <Route path="/*" element={<PortfolioLayout />} />
    </Routes>
  );
}

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppSettingsProvider } from "./state/appSettings";
import Topbar from "./components/Topbar"; // ✅ añade esto
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppSettingsProvider>
        <Topbar /> {/* ✅ Topbar global: portfolio + app */}
        <App />
      </AppSettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);

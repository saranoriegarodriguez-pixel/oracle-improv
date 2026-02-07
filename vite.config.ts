// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // Importa desde cualquier sitio:
      // import { ... } from "@shared/..."
      "@shared": path.resolve(__dirname, "shared"),

      // Si lo quieres más específico:
      // import { ... } from "@sharedData/characters"
      "@sharedData": path.resolve(__dirname, "shared/data"),
    },
  },

  server: {
    proxy: {
      // UI -> Server IA (Express)
      "/api": {
        target: "http://localhost:11434",
        changeOrigin: true,
        secure: false,
      },

      // (opcional) health check
      "/health": {
        target: "http://localhost:11434",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

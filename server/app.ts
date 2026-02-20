// server/app.ts (Render-friendly: auth + usage + chat + api + health)
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { CORS_ORIGIN, AI_PROVIDER } from "./env";

import { googleAuthRouter } from "./routes/googleAuth";
import { usageRouter } from "./usage";

// Si existen en tu repo:
import { chatRouter } from "./routes/chat";
import { apiRouter } from "./routes/api";

// Middlewares opcionales (si los tienes):
// import { enforceSessionLimits } from "./middleware/limits";
// import { rateLimitAI } from "./middleware/rateLimit";

const app = express();

// ✅ detrás de proxies (Render) para cookies secure y req.ip correcto
app.set("trust proxy", 1);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// ✅ CORS robusto con mensajes claros
const allowedOrigins = (CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Requests server-to-server / curl pueden venir sin Origin
      if (!origin) return cb(null, true);

      // Si no configuras allowedOrigins, bloqueamos (mejor que permitir por error)
      if (allowedOrigins.length === 0) {
        console.error("[CORS] No allowed origins configured. Blocking:", origin);
        return cb(new Error("CORS not configured"));
      }

      if (allowedOrigins.includes(origin)) return cb(null, true);

      console.error("[CORS] Blocked origin:", origin, "Allowed:", allowedOrigins);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true, provider: AI_PROVIDER });
});

// ✅ Auth (montado como /api/auth/...)
app.use("/api", googleAuthRouter);

// ✅ Usage (montado como /api/usage/:username)
app.use("/api", usageRouter);

// ✅ Rutas app (evaluate, characterPrompt, etc.)
app.use("/api", apiRouter);

// ✅ Chat (montado como /api/chat)
// Si usas limits/rateLimit, los aplicarías aquí, por ejemplo:
// app.use("/api", rateLimitAI(), enforceSessionLimits({ requireSessionId: AI_PROVIDER === "openai" }), chatRouter);
app.use("/api", chatRouter);

export default app;
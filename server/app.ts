// server/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import {
  CORS_ORIGIN,
  APP_ORIGIN,
  SESSION_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} from "./env";

import { googleAuthRouter } from "./routes/googleAuth";
import { chatRouter } from "./routes/chat";

// si existen en tu repo
import { apiRouter } from "./routes/api";
import { usageRouter } from "./usage";

const app = express();

// ✅ detrás de Vercel/proxies (cookies secure + req.ip bien)
app.set("trust proxy", 1);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// ✅ CORS robusto (con cookies necesitas origen explícito, no "*")
const allowedOrigins = (CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// ⚠️ Importante: NO lanzar Error en CORS, porque puede acabar en crash feo en serverless.
// Mejor bloquear devolviendo "false".
app.use(
  cors({
    origin: (origin, cb) => {
      // Algunas requests (curl / server-to-server) no traen Origin
      if (!origin) return cb(null, true);

      // Si no configuraste CORS_ORIGIN, en prod prefiero bloquear por seguridad
      if (allowedOrigins.length === 0) return cb(null, false);

      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);

// ✅ Health
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// ✅ Diag (para ver si Vercel tiene las env vars puestas)
// IMPORTANTE: no devuelve secretos, solo "tengo/no tengo".
app.get("/api/diag", (_req, res) => {
  res.json({
    ok: true,
    env: {
      APP_ORIGIN,
      CORS_ORIGIN,
      has_SESSION_SECRET: Boolean(SESSION_SECRET),
      has_GOOGLE_CLIENT_ID: Boolean(GOOGLE_CLIENT_ID),
      has_GOOGLE_CLIENT_SECRET: Boolean(GOOGLE_CLIENT_SECRET),
      has_GOOGLE_CALLBACK_URL: Boolean(GOOGLE_CALLBACK_URL),
    },
  });
});

// ✅ Auth: /api/auth/...
app.use("/api", googleAuthRouter);

// ✅ Chat: /api/chat
app.use("/api", chatRouter);

// ✅ App APIs
app.use("/api", apiRouter);

// ✅ Usage: /api/usage/:username
app.use("/api", usageRouter);

// ✅ Error handler final (evita "function crashed" sin info)
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("SERVER_ERROR:", err?.stack || err?.message || err);
    if (res.headersSent) return;
    res.status(500).json({ ok: false, error: err?.message || "Internal error" });
  }
);

export default app;
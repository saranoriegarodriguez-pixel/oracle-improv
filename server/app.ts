// server/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { CORS_ORIGIN } from "./env";

import { googleAuthRouter } from "./routes/googleAuth";
import { chatRouter } from "./routes/chat";

// Si ya existen en tu proyecto
import { apiRouter } from "./routes/api";
import { usageRouter } from "./usage";

const app = express();

// ✅ Importante detrás de Vercel (cookies secure + req.ip)
app.set("trust proxy", 1);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// ✅ CORS con soporte de lista (recomendado para cookies)
// - Si CORS_ORIGIN="*" => origin:true (refleja el origin)
// - Si CORS_ORIGIN="https://a.com,https://b.com" => allowlist
const raw = String(CORS_ORIGIN ?? "").trim();
const allowList = raw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests sin origin (postman/health checks)
      if (!origin) return cb(null, true);

      // Si has puesto "*" o no has puesto nada: dejamos pasar
      if (!raw || allowList.includes("*")) return cb(null, true);

      // allowlist
      if (allowList.includes(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// ✅ Auth: /api/auth/google/start, /api/auth/google/callback, /api/auth/me, /api/auth/logout
app.use(googleAuthRouter);

// ✅ Chat: /api/chat (y aquí bloqueas OpenAI si no hay login)
app.use("/api", chatRouter);

// ✅ App APIs
app.use("/api", apiRouter);

// ✅ Usage: /api/usage/:username
app.use("/api", usageRouter);

export default app;

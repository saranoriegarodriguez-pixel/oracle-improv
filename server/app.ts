// server/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { CORS_ORIGIN } from "./env";

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

app.use(
  cors({
    origin: (origin, cb) => {
      // Algunas requests (curl / server-to-server) no traen Origin
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// ✅ Auth: el router ya incluye /api/auth/... dentro
app.use(googleAuthRouter);

// ✅ Chat: /api/chat
app.use("/api", chatRouter);

// ✅ App APIs
app.use("/api", apiRouter);

// ✅ Usage: /api/usage/:username
app.use("/api", usageRouter);

export default app;

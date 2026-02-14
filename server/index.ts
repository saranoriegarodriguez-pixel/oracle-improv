// server/index.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { PORT, CORS_ORIGIN } from "./env";

import { googleAuthRouter } from "./routes/googleAuth";
import { chatRouter } from "./routes/chat";

// (si ya los tienes en tu proyecto)
import { apiRouter } from "./routes/api";
import { usageRouter } from "./usage";

const app = express();

// ✅ Si estás detrás de Vercel/Render/NGINX (para req.ip y cookies secure)
app.set("trust proxy", 1);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// ✅ CORS: cookies + origen controlado
app.use(
  cors({
    origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN,
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

app.listen(Number(PORT), () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

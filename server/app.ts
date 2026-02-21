import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { CORS_ORIGIN, AI_PROVIDER } from "./env.js";

import { googleAuthRouter } from "./routes/googleAuth.js";
import { usageRouter } from "./usage.js";
import { chatRouter } from "./routes/chat.js";
import { apiRouter } from "./routes/api.js";

const app = express();
app.set("trust proxy", 1);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

const allowedOrigins = (CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

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

app.use("/api", googleAuthRouter);
app.use("/api", usageRouter);
app.use("/api", apiRouter);
app.use("/api", chatRouter);

export default app;
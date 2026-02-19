// server/app.ts (BASE: solo auth + health)
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { CORS_ORIGIN } from "./env";
import { googleAuthRouter } from "./routes/googleAuth";

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
      if (allowedOrigins.length === 0) return cb(null, false);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

// ✅ Solo auth
app.use("/api", googleAuthRouter);

export default app;
// server/index.ts
import express from "express";
import cors from "cors";

import { PORT, CORS_ORIGIN } from "./env";

import { googleAuthRouter } from "./routes/googleAuth";
import { apiRouter } from "./routes/api";
import { usageRouter } from "./usage";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN,
    credentials: true,
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Rutas
app.use(googleAuthRouter);
app.use("/api", apiRouter);       // ✅ /api/evaluate + /api/characterPrompt
app.use("/api", usageRouter);     // ✅ /api/usage/:username

app.listen(Number(PORT), () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// server/index.ts
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";

import "./auth/googleStrategy"; // 🔥 importante: carga la estrategia
import { PORT, CORS_ORIGIN, SESSION_SECRET } from "./env";

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

// 🔥 Necesario para mantener la sesión del usuario
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// 🔥 Necesario para Google OAuth
app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Rutas
app.use("/auth", googleAuthRouter); // 🔥 ahora todo queda bajo /auth
app.use("/api", apiRouter);
app.use("/api", usageRouter);

app.listen(Number(PORT), () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

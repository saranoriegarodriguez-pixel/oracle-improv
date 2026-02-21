// server/types/express.d.ts
import "express";
import type { SessionUser } from "../auth/sessions.js";

declare global {
  namespace Express {
    interface User extends SessionUser {}

    interface Request {
      user?: SessionUser | null;
    }
  }
}

// server/usage.ts
import { Router } from "express";
import { MAX_SESSIONS_PER_DAY } from "./env";
import { getUsageForUser } from "./middleware/limits";

export const usageRouter = Router();

// GET /api/usage/:username
usageRouter.get("/:username", (req, res) => {
  const username = String(req.params.username ?? "").trim().toLowerCase();
  const usedToday = username ? getUsageForUser(username) : 0;
  const remaining = Math.max(0, MAX_SESSIONS_PER_DAY - usedToday);

  res.json({
    username,
    usedToday,
    remaining,
    limit: MAX_SESSIONS_PER_DAY,
  });
});

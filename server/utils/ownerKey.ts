// server/utils/ownerKey.ts
import type { Request } from "express";

export function getOwnerKey(req: Request) {
  const body = (req.body ?? {}) as any;

  const username =
    typeof body.username === "string" && body.username.trim()
      ? body.username.trim()
      : "";

  if (username) return `user:${username.toLowerCase()}`;

  // Express req.ip respeta trust proxy si está configurado
  const ip = (req.ip || "").trim() || req.socket.remoteAddress || "unknown";
  return `ip:${ip}`;
}


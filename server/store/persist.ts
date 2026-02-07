// server/store/persist.ts
import fs from "fs";
import path from "path";

type Json = any;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function readJsonFile(filepath: string, fallback: Json) {
  try {
    if (!fs.existsSync(filepath)) return fallback;
    const raw = fs.readFileSync(filepath, "utf-8");
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Escritura atómica: .tmp + rename */
export function writeJsonFileAtomic(filepath: string, data: Json) {
  const dir = path.dirname(filepath);
  ensureDir(dir);

  const tmp = filepath + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data), "utf-8");
  fs.renameSync(tmp, filepath);
}

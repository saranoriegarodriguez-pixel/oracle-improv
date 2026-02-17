// api/index.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../server/app";

// Importante: desactiva el bodyParser de Vercel para que Express maneje body/json
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Express app es una función (req,res)
  return app(req as any, res as any);
}


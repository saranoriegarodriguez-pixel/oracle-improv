// server/routes/api.ts
import { Router } from "express";
import { evaluateHandler } from "../evaluate";
import { characterPromptHandler } from "../characterPrompt";

export const apiRouter = Router();

// POST /api/evaluate
apiRouter.post("/evaluate", evaluateHandler);

// POST /api/characterPrompt
apiRouter.post("/characterPrompt", characterPromptHandler);

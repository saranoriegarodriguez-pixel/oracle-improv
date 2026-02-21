import { Router } from "express";
import { evaluateHandler } from "../evaluate.js";
import { characterPromptHandler } from "../characterPrompt.js";

export const apiRouter = Router();

// POST /api/evaluate
apiRouter.post("/evaluate", evaluateHandler);

// POST /api/characterPrompt
apiRouter.post("/characterPrompt", characterPromptHandler);

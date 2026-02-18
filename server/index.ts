// server/index.ts
import "dotenv/config";
import app from "./app";
import { PORT } from "./env";

app.listen(Number(PORT), () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

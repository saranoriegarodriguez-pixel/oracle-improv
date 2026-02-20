// server/index.ts
import "dotenv/config";
import app from "./app";
import { PORT } from "./env";

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
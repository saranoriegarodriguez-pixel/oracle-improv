import "dotenv/config";
import app from "./app.js";
import { PORT } from "./env.js";

app.listen(Number(PORT), () => {
  console.log(`🚀 Server running on :${PORT}`);
});
import { defineConfig } from "drizzle-kit";
import { fileURLToPath } from "url";
import path from "path";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  out: "./backend/migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: path.resolve(__dirname, "backend/data/database.sqlite"),
  },
  verbose: true,
  strict: true,
  // breakpoints: true, // Enable if you want SQL breakpoints in migrations
});
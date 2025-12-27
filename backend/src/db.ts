// backend/db.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure a data folder exists
const dataDir = path.resolve(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbFile = path.resolve(dataDir, "database.sqlite");

console.log("Database file path:", dbFile);
console.log("Database file exists:", fs.existsSync(dbFile));

// Create SQLite database instance
const sqliteDb = new Database(dbFile);

// Enable WAL mode for better concurrent access
sqliteDb.pragma("journal_mode = WAL");

// Export Drizzle ORM instance
export const db = drizzle(sqliteDb);

// Export the SQLite instance if needed for raw queries
export const sqlite = sqliteDb;
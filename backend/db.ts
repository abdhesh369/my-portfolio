// backend/db.ts
import { Database } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";

// Ensure a data folder exists
const dataDir = path.resolve(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbFile = path.resolve(dataDir, "database.sqlite");

// Create SQLite database
const sqliteDb = new Database(dbFile);

// Export Drizzle ORM instance
export const db = drizzle(sqliteDb);

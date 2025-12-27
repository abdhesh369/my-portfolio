// backend/db.ts
import Database from "better-sqlite3";
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

// Create SQLite database instance
const sqliteDb = new Database(dbFile);

// Enable WAL mode for better concurrent access
sqliteDb.pragma("journal_mode = WAL");

// Export Drizzle ORM instance
export const db = drizzle(sqliteDb);

// Export the SQLite instance if needed for raw queries
export const sqlite = sqliteDb;
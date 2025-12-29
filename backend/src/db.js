import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import * as schema from "../../shared/schema";
// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Logging utility
function log(message, level = "info") {
    const timestamp = new Date().toISOString();
    const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✓";
    console.log(`${prefix} [${timestamp}] [DB] ${message}`);
}
// Ensure data directory exists
const dataDir = path.resolve(__dirname, "../data");
try {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        log(`Created data directory: ${dataDir}`);
    }
}
catch (error) {
    log(`Failed to create data directory: ${error}`, "error");
    throw error;
}
// Database file path
const dbFile = path.resolve(dataDir, "database.sqlite");
log(`Database file path: ${dbFile}`);
// Initialize SQLite database
let sqliteDb;
try {
    sqliteDb = new Database(dbFile, {
        verbose: process.env.NODE_ENV !== "production" ? console.log : undefined,
    });
    log(`Database ${fs.existsSync(dbFile) ? "opened" : "created"} successfully`);
}
catch (error) {
    log(`Failed to initialize database: ${error}`, "error");
    throw error;
}
// Configure SQLite for better performance and reliability
try {
    // WAL mode for better concurrent access
    sqliteDb.pragma("journal_mode = WAL");
    // Improve performance
    sqliteDb.pragma("synchronous = NORMAL"); // Balance between safety and speed
    sqliteDb.pragma("cache_size = -64000"); // 64MB cache
    sqliteDb.pragma("temp_store = MEMORY"); // Store temp tables in memory
    sqliteDb.pragma("mmap_size = 30000000000"); // Memory-mapped I/O
    // Foreign key constraints
    sqliteDb.pragma("foreign_keys = ON");
    log("SQLite pragmas configured successfully");
}
catch (error) {
    log(`Failed to configure SQLite pragmas: ${error}`, "error");
    throw error;
}
// Create Drizzle ORM instance with schema
export const db = drizzle(sqliteDb, { schema });
// Export the raw SQLite instance for advanced queries
export const sqlite = sqliteDb;
// Export schema for use in other files
export { schema };
// Database health check function
export function checkDatabaseHealth() {
    try {
        // Simple query to check if database is responsive
        const result = sqliteDb.prepare("SELECT 1 as health").get();
        if (result && result.health === 1) {
            return {
                healthy: true,
                message: "Database is healthy",
                details: {
                    path: dbFile,
                    size: fs.statSync(dbFile).size,
                    mode: sqliteDb.pragma("journal_mode"),
                },
            };
        }
        return {
            healthy: false,
            message: "Database query returned unexpected result",
        };
    }
    catch (error) {
        return {
            healthy: false,
            message: `Database health check failed: ${error}`,
            details: { error },
        };
    }
}
// Graceful shutdown handler
export async function closeDatabaseConnection() {
    try {
        // Checkpoint WAL file
        sqliteDb.pragma("wal_checkpoint(TRUNCATE)");
        // Close connection
        sqliteDb.close();
        log("Database connection closed successfully");
    }
    catch (error) {
        log(`Error closing database connection: ${error}`, "error");
        throw error;
    }
}
// Backup function (useful for production)
export function createBackup(backupPath) {
    try {
        const backupDir = backupPath || path.resolve(dataDir, "backups");
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFile = path.join(backupDir, `backup-${timestamp}.sqlite`);
        // Checkpoint WAL before backup
        sqliteDb.pragma("wal_checkpoint(TRUNCATE)");
        // Use VACUUM INTO for safe backup (SQLite 3.27.0+)
        sqliteDb.prepare(`VACUUM INTO ?`).run(backupFile);
        log(`Database backup created: ${backupFile}`);
        return backupFile;
    }
    catch (error) {
        log(`Failed to create database backup: ${error}`, "error");
        throw error;
    }
}
// Optional: Clean old backups (keep last N backups)
export function cleanOldBackups(keepCount = 5) {
    try {
        const backupDir = path.resolve(dataDir, "backups");
        if (!fs.existsSync(backupDir)) {
            return;
        }
        const backups = fs
            .readdirSync(backupDir)
            .filter((file) => file.endsWith(".sqlite"))
            .map((file) => ({
            name: file,
            path: path.join(backupDir, file),
            time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
        }))
            .sort((a, b) => b.time - a.time);
        // Delete old backups
        backups.slice(keepCount).forEach((backup) => {
            fs.unlinkSync(backup.path);
            log(`Deleted old backup: ${backup.name}`);
        });
    }
    catch (error) {
        log(`Failed to clean old backups: ${error}`, "error");
    }
}
// Log database info on initialization
log(`Database initialized with ${Object.keys(schema).length} tables`);
// Handle process termination
process.on("beforeExit", () => {
    closeDatabaseConnection().catch((error) => {
        log(`Error during cleanup: ${error}`, "error");
    });
});

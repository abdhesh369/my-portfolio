import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import { registerRoutes } from "./routes";
import { seedDatabase } from "./seed";

// ------------------- APP SETUP -------------------
const app = express();
const httpServer = createServer(app);

// Extend IncomingMessage for rawBody
declare module "http" {
  interface IncomingMessage {
    rawBody: Buffer;
  }
}

// ------------------- LOGGING -------------------
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// ------------------- MIDDLEWARE -------------------

// CORS (required for separate frontend)
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : ["http://localhost:5173", "http://localhost:4173"],
    credentials: true,
  })
);

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Body parsing
app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const originalJson = res.json;
  let capturedJson: any;

  res.json = function (body, ...args) {
    capturedJson = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// ------------------- HEALTH CHECK -------------------
app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.get("/healthz", (_req, res) => {
  res.status(200).json({
    ok: true,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ------------------- GRACEFUL SHUTDOWN -------------------
function setupGracefulShutdown() {
  const shutdown = (signal: string) => {
    log(`${signal} received, shutting down...`, "shutdown");

    httpServer.close(() => {
      log("HTTP server closed", "shutdown");
      process.exit(0);
    });

    setTimeout(() => {
      log("Forced shutdown", "shutdown");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

// ------------------- MAIN -------------------
(async () => {
  try {
    log("Starting server...", "startup");

    // Seed database (safe if idempotent)
    try {
      await seedDatabase();
      log("Database seed complete", "startup");
    } catch (err) {
      log("Seed skipped or failed (safe to ignore)", "startup");
    }

    // Register API routes
    await registerRoutes(httpServer, app);
    log("API routes registered", "startup");

    // Global error handler (LAST)
    app.use(
      (err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        log(`Error ${status}: ${message}`, "error");

        res.status(status).json({
          message,
          ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
        });
      }
    );

    setupGracefulShutdown();

    // Start server
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = "0.0.0.0";

    httpServer.listen(port, host, () => {
      log(`Server running on ${host}:${port}`, "startup");
    });
  } catch (error) {
    log(`Startup failed: ${error}`, "error");
    process.exit(1);
  }
})();
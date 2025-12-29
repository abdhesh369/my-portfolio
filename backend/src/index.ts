import path from "path";
import { fileURLToPath } from "url";
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import { registerRoutes } from "./routes";
import { seedDatabase } from "./seed";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Extend IncomingMessage for rawBody
declare module "http" {
  interface IncomingMessage {
    rawBody: Buffer;
  }
}

// ------------------- LOGGING UTILITY -------------------
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

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL || false // Set your production domain
    : ["http://localhost:5173", "http://localhost:4173"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Security Headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Body Parsing with raw body capture
app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const originalResJson = res.json;
  let capturedJson: any;

  res.json = function (body, ...args) {
    capturedJson = body;
    return originalResJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      let logLine = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;

      // Only log response body in development
      if (process.env.NODE_ENV !== "production" && capturedJson) {
        const jsonStr = JSON.stringify(capturedJson);
        logLine += ` :: ${jsonStr.length > 200 ? jsonStr.substring(0, 200) + "..." : jsonStr}`;
      }

      log(logLine);
    }
  });

  next();
});

// Health check
app.get("/healthz", (_req, res) => {
  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// ------------------- GRACEFUL SHUTDOWN -------------------
function setupGracefulShutdown() {
  const shutdown = async (signal: string) => {
    log(`${signal} received, starting graceful shutdown...`, "shutdown");

    httpServer.close(() => {
      log("HTTP server closed", "shutdown");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      log("Forced shutdown after timeout", "shutdown");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("uncaughtException", (error) => {
    log(`Uncaught Exception: ${error.message}`, "error");
    console.error(error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, "error");
    console.error(reason);
  });
}

// ------------------- MAIN SERVER -------------------
(async () => {
  try {
    log("Starting server initialization...", "startup");

    // 1️⃣ Seed database before registering routes
    try {
      await seedDatabase();
      log("Database seeded successfully", "startup");
    } catch (error) {
      log(`Database seeding failed: ${error}`, "error");
      // Continue anyway - seeding might fail if data already exists
    }

    // 2️⃣ Register API routes
    await registerRoutes(httpServer, app);
    log("API routes registered", "startup");

    // 3️⃣ Serve frontend in production
    // 3️⃣ Serve frontend in production
    if (process.env.NODE_ENV === "production") {
      const frontendDist = path.resolve(__dirname, "../../dist/public");

      app.use(express.static(frontendDist, {
        maxAge: "1y",
        etag: true,
        lastModified: true,
      }));

      // SPA fallback - must be after API routes
      app.get(/^(?!\/api).*/, (_req, res) => {
        res.sendFile(path.join(frontendDist, "index.html"));
      });

      log("Serving frontend from: " + frontendDist, "startup");
    } else {
      try {
        const { setupVite } = await import("./vite-setup");
        await setupVite(httpServer, app);
        log("Vite dev server configured", "startup");
      } catch (error) {
        log(`Failed to setup Vite: ${error}`, "error");
        throw error;
      }
    }

    // 4️⃣ Global error handler (must be last)
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error ${status}: ${message}`, "error");

      // Log stack trace in development
      if (process.env.NODE_ENV !== "production") {
        console.error(err.stack);
      }

      res.status(status).json({
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
      });
    });

    // 6️⃣ Setup graceful shutdown
    setupGracefulShutdown();

    // 7️⃣ Start server
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0";

    httpServer.listen(port, host, () => {
      log(`Server running on http://${host}:${port}`, "startup");
      log(`Environment: ${process.env.NODE_ENV || "development"}`, "startup");
      log(`Ready to accept connections`, "startup");
    });

  } catch (error) {
    log(`Failed to start server: ${error}`, "error");
    console.error(error);
    process.exit(1);
  }
})();
import path from "path";
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { seedDatabase } from "./seed"; // <- Import your seeding function

const app = express();
const httpServer = createServer(app);

// Extend IncomingMessage for rawBody
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ------------------- MIDDLEWARE -------------------
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

// Simple logging utility
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

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
      if (capturedJson) logLine += ` :: ${JSON.stringify(capturedJson)}`;
      log(logLine);
    }
  });

  next();
});

// Health check
app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));

// ------------------- MAIN SERVER -------------------
(async () => {
  try {
    // 1️⃣ Seed database before registering routes
    await seedDatabase();

    // 2️⃣ Register routes
    await registerRoutes(httpServer, app);

    // 3️⃣ Serve frontend in production
    if (process.env.NODE_ENV === "production") {
      const frontendDist = path.join(__dirname, "../../dist/public");
      app.use(express.static(frontendDist));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(frontendDist, "index.html"));
      });
    } else {
      const { setupVite } = await import("./vite-setup");
      await setupVite(httpServer, app);
    }

    // 4️⃣ Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${message}`, "error");
      res.status(status).json({ message });
    });

    // 5️⃣ Start server
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
      log(`Server is running on port ${port}`);
      log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    log(`Failed to start server: ${error}`, "error");
    process.exit(1);
  }
})();

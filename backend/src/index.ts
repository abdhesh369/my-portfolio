// backend/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes"; // ensure routes.ts is in backend/
import { serveStatic } from "./static";    // ensure static.ts is in backend/
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Extend IncomingMessage for rawBody
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Middleware to parse JSON and capture raw body
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Logging utility
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Request logging middleware for /api routes
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Register your routes
    await registerRoutes(httpServer, app);

    // Serve static files in production, Vite setup in development
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite-setup");
      await setupVite(httpServer, app);
    }

    // Global error handler (must be after routes and vite setup)
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${message}`, "error");
      res.status(status).json({ message });
    });

    // Start HTTP server
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        log(`Server is running on port ${port}`);
        log(`Environment: ${process.env.NODE_ENV || "development"}`);
      },
    );
  } catch (error) {
    log(`Failed to start server: ${error}`, "error");
    process.exit(1);
  }
})();
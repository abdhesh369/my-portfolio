// backend/static.ts
import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Adjust path to the frontend build output
  const distPath = path.resolve(__dirname, "../frontend/dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}. Make sure to build the frontend first using 'npm run build' in frontend.`,
    );
  }

  // Serve static files from the frontend build
  app.use(express.static(distPath));

  // For all other routes, serve index.html (SPA support)
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  console.log(`Static frontend is being served from: ${distPath}`);
}

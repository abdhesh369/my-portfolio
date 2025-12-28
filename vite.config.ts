import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react({
      // jsxRuntime: 'automatic', // default
      // babel: {
      //   plugins: [], // Add babel plugins if needed
      // },
    }),
    runtimeErrorOverlay(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "frontend", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "frontend"),
  publicDir: path.resolve(__dirname, "attached_assets"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          react: ["react", "react-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
          ],
          utils: ["clsx", "tailwind-merge", "class-variance-authority"],
          query: ["@tanstack/react-query"],
          motion: ["framer-motion"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: "esbuild",
    target: "es2020",
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: false,
    cors: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      "/ws": {
        target: "ws://localhost:5000",
        ws: true,
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: true,
    },
    fs: {
      strict: true,
      allow: [
        path.resolve(__dirname, "frontend"),
        path.resolve(__dirname, "attached_assets"),
        path.resolve(__dirname, "shared"),
      ],
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
    open: false,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@tanstack/react-query",
      "framer-motion",
      "lucide-react",
      "wouter",
    ],
    exclude: ["@replit/vite-plugin-runtime-error-modal"],
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
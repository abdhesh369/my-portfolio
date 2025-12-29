import { createServer } from "vite";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import viteConfig from "../../vite.config";
// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function setupVite(server, app) {
    const viteDevServer = await createServer({
        ...viteConfig,
        configFile: false,
        server: {
            middlewareMode: true,
            hmr: { server },
        },
        appType: "custom",
    });
    app.use(viteDevServer.middlewares);
    // Handle all non-API routes - FIXED: Use regex instead of "*"
    app.get(/^(?!\/api).*/, async (req, res, next) => {
        const url = req.originalUrl;
        try {
            // Resolve paths from project root
            const projectRoot = path.resolve(__dirname, "../..");
            const clientTemplate = path.join(projectRoot, "frontend", "index.html");
            if (!fs.existsSync(clientTemplate)) {
                throw new Error(`Template not found: ${clientTemplate}`);
            }
            let template = await fs.promises.readFile(clientTemplate, "utf-8");
            // Add cache busting for dev
            template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
            const page = await viteDevServer.transformIndexHtml(url, template);
            res.status(200).set({ "Content-Type": "text/html" }).end(page);
        }
        catch (e) {
            viteDevServer.ssrFixStacktrace(e);
            console.error("Vite error:", e);
            next(e);
        }
    });
}

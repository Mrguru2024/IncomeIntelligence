// Firebase-free server entry point
import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { config } from "dotenv";
import { registerRoutes } from "./routes";

// Load environment variables
config();
console.log(".env file loaded successfully");

// Required for import.meta.dirname with ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  // Use middleware and API routes
  await registerRoutes(app);

  // Create Vite development server for the client
  const vite = await createViteServer({
    configFile: path.resolve(__dirname, "../client/vite.firebase-free.config.ts"),
    server: {
      middlewareMode: true,
      hmr: { server: httpServer }
    }
  });

  // Use Vite middleware
  app.use(vite.middlewares);

  // Handle client-side routes
  app.use("*", async (req, res) => {
    try {
      const template = path.resolve(__dirname, "../client/firebase-free.html");
      let html = await fs.promises.readFile(template, "utf-8");
      
      // Transform HTML with Vite
      html = await vite.transformIndexHtml(req.originalUrl, html);
      
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      console.error(e);
      res.status(500).end("Internal Server Error");
    }
  });

  const port = process.env.PORT || 5000;
  httpServer.listen(port, () => {
    console.log(`Server is running on port ${port} - Firebase-free mode`);
  });
}

startServer().catch(console.error);
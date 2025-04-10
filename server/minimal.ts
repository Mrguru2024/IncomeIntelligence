import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { createServer as createViteServer } from 'vite';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

async function startServer() {
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // Serve static files from the dist directory
  app.use(express.static(path.resolve(__dirname, '../dist')));
  
  // Serve minimal.html for root requests
  app.get('/', async (req, res) => {
    try {
      let template = fs.readFileSync(
        path.resolve(__dirname, '../client/minimal.html'),
        'utf-8'
      );
      
      template = await vite.transformIndexHtml(req.url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      console.log(e);
      res.status(500).end((e as Error).stack);
    }
  });

  // Catch-all route to serve the minimal app for client-side routing
  app.use('*', async (req, res) => {
    try {
      let template = fs.readFileSync(
        path.resolve(__dirname, '../client/minimal.html'),
        'utf-8'
      );
      
      template = await vite.transformIndexHtml(req.url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      console.log(e);
      res.status(500).end((e as Error).stack);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Start the server
  httpServer.listen(PORT, () => {
    console.log(`[MINIMAL] Server is running on port ${PORT}`);
  });
}

startServer().catch((e) => {
  console.error('Error starting server:', e);
});
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { createServer as createViteServer } from 'vite';

// Get the current file's directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

async function startServer() {
  // Create a Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // API routes
  app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', message: 'Clean Firebase-free server is running' });
  });

  // Serve the clean HTML for all routes to support client-side routing
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;
      
      // Use the minimal HTML file
      const template = fs.readFileSync(
        path.resolve(__dirname, 'client/minimal.html'),
        'utf-8'
      );
      
      // Process the HTML with Vite
      const transformedHtml = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(transformedHtml);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.stack);
    }
  });

  // Create and start the HTTP server
  const httpServer = createServer(app);
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[CLEAN] Server is running on port ${PORT}`);
  });
}

startServer().catch((e) => {
  console.error('Error starting server:', e);
});
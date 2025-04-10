import express from 'express';
import { createServer } from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const vite = await createViteServer({
    server: { middlewareMode: true },
    configFile: path.resolve(__dirname, '../client/vite.minimal.config.ts'),
    root: path.resolve(__dirname, '../client'),
  });

  // Use Vite as middleware
  app.use(vite.middlewares);

  // API routes can be added here if needed
  app.get('/api/healthcheck', (req, res) => {
    res.json({ status: 'ok', message: 'Minimal server is running' });
  });

  // Start the server
  const port = process.env.PORT || 4000; // Use a different port to avoid conflicts
  const server = createServer(app);
  
  server.listen(port, () => {
    console.log(`[minimal] Server is running on port ${port}`);
  });
}

startServer().catch(console.error);
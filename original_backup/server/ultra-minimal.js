// Ultra minimal Express server with no dependencies on existing code
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const port = process.env.PORT || 5173; // Use a different port

// Serve static files
app.use(express.static(path.resolve(__dirname, '..')));

// Serve the ultra-minimal HTML for all routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../ultra-minimal.html'));
});

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(port, () => {
  console.log(`[ULTRA-MINIMAL] Server running on port ${port}`);
});
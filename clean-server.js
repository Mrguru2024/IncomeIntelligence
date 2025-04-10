/**
 * Clean server implementation without Firebase dependencies
 * This server loads minimal.html instead of the standard index.html
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'client/public')));
app.use(express.static(path.join(__dirname, 'client')));

// Middleware to modify HTML content
app.use('/', (req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    // Read the minimal HTML file
    fs.readFile(path.join(__dirname, 'client/minimal.html'), 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading minimal.html:', err);
        return next();
      }
      
      res.setHeader('Content-Type', 'text/html');
      res.send(data);
    });
  } else {
    next();
  }
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

// Start the server
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
  console.log(`Clean server running on port ${port}`);
});
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5001; // Use a different port than the main app

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Basic API endpoint
app.get('/api/green/status', (req, res) => {
  res.json({
    status: 'active',
    version: 'green',
    firebaseFree: true,
    message: 'The GREEN version is running successfully!'
  });
});

// Serve the index.html for all routes
app.get('*', (req, res) => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  res.send(html);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 GREEN Server running on port ${PORT}`);
});
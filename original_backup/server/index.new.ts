import express from "express";
import cors from "cors";
import { setupVite, log } from "./vite";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

// Create Express application
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Create HTTP server and set up API routes
(async () => {
  // Register all API routes first
  const server = await registerRoutes(app);
  
  // Setup Vite in development mode (this serves the React app)
  // NOTE: This needs to come after all API routes to ensure the correct order of middleware
  await setupVite(app, server);
  
  // Set up the port - Replit workflows use port 5000
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  // Start server
  server.listen(port, '0.0.0.0', () => {
    log(`Server is running on port ${port} - Replit compatible`);
  });
})();
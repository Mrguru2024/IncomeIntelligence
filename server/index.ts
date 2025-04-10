import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http"; // Add this import explicitly
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import csrf from "csurf";
import { preventApiAbuse, sanitizeQueryParams, setSecurityHeaders } from "./middleware/apiProtection";
import { optionalAuth } from "./middleware/authMiddleware";
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
const result = dotenv.config();
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}

const app = express();

// Trust the Replit proxy
app.set('trust proxy', 1);

// Security Headers using helmet with additional security options
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://plaid.com", "https://replit.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://replit.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    }
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: {
    maxAge: 15552000, // 180 days in seconds
    includeSubDomains: true
  }
}));

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || 'https://yourdomainhere.com' 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours in seconds
}));

// Body parsers
app.use(express.json({ limit: '10kb' })); // Limit body size for JSON
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'userId', 'date', 'category', 'type', 'source', 'period', 'month', 'year'
  ]
}));

// Rate limiting for API endpoints
const standardApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, 
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', standardApiLimiter);

// More restrictive rate limiting for AI endpoints which use external services
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many AI requests from this IP, please try again after 5 minutes'
});
app.use('/api/ai/', aiLimiter);

// CSRF protection for any routes that change state
// Not applied to API routes assuming they will use token auth
const csrfProtection = csrf({ cookie: true });
// Apply CSRF protection selectively to non-API routes that change state
// app.use('/path-needing-csrf-protection', csrfProtection);

// Custom security middleware
app.use(preventApiAbuse);
app.use(sanitizeQueryParams);
app.use(setSecurityHeaders);

// Add optional authentication middleware to populate req.user when a valid token is present
app.use(optionalAuth);

// Logging middleware for API endpoints
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        // Avoid logging sensitive data
        const sanitizedResponse = { ...capturedJsonResponse };
        // Remove sensitive fields from logging
        if (sanitizedResponse.password) sanitizedResponse.password = "[REDACTED]";
        if (sanitizedResponse.token) sanitizedResponse.token = "[REDACTED]";
        if (sanitizedResponse.accessToken) sanitizedResponse.accessToken = "[REDACTED]";
        if (sanitizedResponse.authToken) sanitizedResponse.authToken = "[REDACTED]";

        logLine += ` :: ${JSON.stringify(sanitizedResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  const dirname = new URL('.', import.meta.url).pathname;
  
  // Serve static files from public directory
  app.use(express.static(path.join(dirname, '../client/public')));
  app.use(express.static(path.join(dirname, '../dist/public')));

  // Special route for the mock app entry point that avoids Firebase 
  app.get('/mock', (req, res) => {
    // Send a simple HTML page without any JavaScript to avoid Firebase issues
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Stackr - Maintenance Mode</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">
          <style>
            :root {
              --primary: #4f46e5;
              --primary-foreground: #ffffff;
              --background: #f8fafc;
              --foreground: #0f172a;
              --card: #ffffff;
              --card-foreground: #1e293b;
              --border: #e2e8f0;
              --ring: #4f46e5;
              --radius: 0.5rem;
            }
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              background-color: var(--background);
              color: var(--foreground);
              line-height: 1.5;
              padding: 2rem;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            
            .header {
              text-align: center;
              margin-bottom: 2rem;
            }
            
            .logo {
              font-size: 2.5rem;
              font-weight: 700;
              color: var(--primary);
              margin-bottom: 0.5rem;
            }
            
            .subtitle {
              font-size: 1.25rem;
              color: var(--card-foreground);
            }
            
            .card {
              background-color: var(--card);
              border-radius: var(--radius);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              padding: 1.5rem;
              margin-bottom: 1.5rem;
            }
            
            .alert {
              background-color: #fff8e1;
              border-left: 4px solid #ffc107;
              padding: 1rem;
              margin-bottom: 1.5rem;
              border-radius: 0.25rem;
            }
            
            .alert-title {
              font-weight: 600;
              color: #b45309;
              margin-bottom: 0.5rem;
            }
            
            .alert-message {
              color: #92400e;
              font-size: 0.875rem;
            }
            
            h2 {
              font-size: 1.5rem;
              margin-bottom: 1rem;
              color: var(--card-foreground);
            }
            
            .status-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.75rem 0;
              border-bottom: 1px solid var(--border);
            }
            
            .status-label {
              color: var(--card-foreground);
            }
            
            .status-value {
              font-weight: 500;
            }
            
            .status-online {
              color: #10b981;
            }
            
            .status-error {
              color: #ef4444;
            }
            
            .feature-list {
              list-style: none;
              margin-top: 1rem;
            }
            
            .feature-list li {
              padding: 0.5rem 0;
              color: var(--card-foreground);
            }
            
            .feature-list li:before {
              content: "✓ ";
              color: #10b981;
            }
            
            .button {
              display: inline-block;
              background-color: var(--primary);
              color: var(--primary-foreground);
              padding: 0.5rem 1rem;
              border-radius: var(--radius);
              text-decoration: none;
              font-weight: 500;
              margin-top: 1rem;
              border: none;
              cursor: pointer;
            }
            
            .button:hover {
              opacity: 0.9;
            }
            
            .footer {
              text-align: center;
              margin-top: 2rem;
              color: #6b7280;
              font-size: 0.875rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Stackr</div>
              <div class="subtitle">Service Provider Finance</div>
            </div>
            
            <div class="alert">
              <div class="alert-title">Application Maintenance</div>
              <div class="alert-message">
                We're currently resolving issues with Firebase dependencies. 
                All server-side functionality remains active, but the main application interface is temporarily unavailable.
              </div>
            </div>
            
            <div class="card">
              <h2>System Status</h2>
              <div class="status-item">
                <span class="status-label">Backend API</span>
                <span class="status-value status-online">✓ Online</span>
              </div>
              
              <div class="status-item">
                <span class="status-label">PostgreSQL Database</span>
                <span class="status-value status-online">✓ Connected</span>
              </div>
              
              <div class="status-item">
                <span class="status-label">Firebase Dependencies</span>
                <span class="status-value status-error">✗ Removing</span>
              </div>
            </div>
            
            <div class="card">
              <h2>Available Features</h2>
              <ul class="feature-list">
                <li>40/30/30 Income Split Management</li>
                <li>Income Tracking & History</li>
                <li>Budget Planning With Preset Splits</li>
                <li>AI-Powered Financial Advice</li>
                <li>Bank Connection Management</li>
                <li>Stackr Gigs Platform</li>
              </ul>
            </div>
            
            <div class="card">
              <h2>Next Steps</h2>
              <p>Our team is working to fully remove Firebase dependencies and restore the application as soon as possible.</p>
              <p>All your data remains secure, and API access to your information is still available.</p>
              <div style="text-align: center; margin-top: 1rem;">
                <a href="/api/status" target="_blank" class="button">Check API Status</a>
              </div>
            </div>
            
            <div class="footer">
              <p>Status updated: April 2025</p>
              <p>We apologize for the inconvenience and appreciate your patience.</p>
            </div>
          </div>
        </body>
      </html>
    `);
  });

  // Create a variable to track if we're in Firebase-free mode
  const isFirebaseFreeMode = process.argv.includes('firebase-free-mode');
  
  // Serve Firebase-free version (legacy approach)
  app.get('/firebase-free', (req, res) => {
    const firebaseFreeHtmlPath = path.join(dirname, '../client/firebase-free.html');
    
    console.log('Serving Firebase-free HTML from:', firebaseFreeHtmlPath);
    
    if (fs.existsSync(firebaseFreeHtmlPath)) {
      // Set a cache control header to prevent caching
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      res.sendFile(firebaseFreeHtmlPath);
    } else {
      console.log('Firebase-free HTML file not found at:', firebaseFreeHtmlPath);
      res.status(404).send('Firebase-free version not found');
    }
  });
  
  // Serve the clean build
  app.get('/clean', (req, res) => {
    const cleanHtmlPath = path.join(dirname, '../client/clean-build.html');
    
    console.log('Serving clean HTML from:', cleanHtmlPath);
    
    if (fs.existsSync(cleanHtmlPath)) {
      // Set a cache control header to prevent caching
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      res.sendFile(cleanHtmlPath);
    } else {
      console.log('Clean HTML file not found at:', cleanHtmlPath);
      res.status(404).send('Clean version not found');
    }
  });
  
  // Always use clean version
  const useCleanVersion = true;
  
  // Serve our primary entry point with a completely static demo version
  app.get('/', (req, res) => {
    console.log('Serving Stackr Finance demo page');
    
    // Path to our demo HTML file
    const demoHtmlPath = path.join(dirname, '../client/stackr-demo.html');
    
    if (fs.existsSync(demoHtmlPath)) {
      // Set cache-control headers to ensure fresh content
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      // Send the demo file
      res.sendFile(demoHtmlPath);
    } else {
      console.error('Demo HTML file not found at:', demoHtmlPath);
      // Fall back to the simple maintenance page
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Stackr - Maintenance</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
            h1 { color: #4f46e5; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
          </style>
        </head>
        <body>
          <h1>Stackr Finance</h1>
          <div class="card">
            <h2>Maintenance Mode</h2>
            <p>We're currently performing maintenance to remove Firebase dependencies. Please check back shortly.</p>
            <p>The backend API remains fully functional during this maintenance.</p>
          </div>
        </body>
        </html>
      `);
    }
  });
  
  // Handle all other routes except API routes and special routes
  app.get(/^\/(?!api).*$/, (req, res, next) => {
    // Let special routes be handled by their handlers
    if (req.path === '/mock' || req.path === '/firebase-free' || req.path === '/clean') {
      next();
      return;
    }
    
    // Redirect to our clean version
    res.redirect('/clean');
  });

  // Basic error handling
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  });

  // Handle 404s
  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Not found' });
  });


  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // IMPORTANT: Replit workflows are configured for port 5000
  // use this port or the workflow won't be able to connect
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  
  // Start server
  server.listen(port, '0.0.0.0', () => {
    log(`Server is running on port ${port} - Replit compatible`);
  });
})();
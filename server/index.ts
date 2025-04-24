import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
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

// Module script handling middleware
const moduleScriptHandler = (req: Request, res: Response, next: NextFunction) => {
  if (
    req.path.endsWith('.tsx') || 
    req.path.endsWith('.ts') || 
    req.path.endsWith('.jsx') || 
    req.path.endsWith('.js') || 
    req.path.endsWith('.mjs')
  ) {
    // Allow the browser to handle modules correctly
    res.setHeader('Content-Type', 'application/javascript');
    res.removeHeader('X-Content-Type-Options');
  }
  next();
};
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initializeAIClients } from './ai-service';
import { initializeEmailClient } from './email-service';
import { initializePerplexityService } from './services/perplexity-service';
import { initializeImageGenerationService } from './services/image-generation-service';
import { errorHandler } from './middleware/error-handler';
import { initializeServices } from './services';
import { logger } from './utils/logger';
import { config } from './config';
import http from 'http';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

// Initialize services
try {
  initializeAIClients();
  initializeEmailClient();
  initializePerplexityService();
  initializeImageGenerationService();
} catch (error) {
  console.error('Error initializing services:', error);
  process.exit(1);
}

const app = express();

// Trust the Replit proxy
app.set('trust proxy', 1);

// HTTP to HTTPS redirection middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(`https://${req.get('host')}${req.url}`);
  }
  next();
});

// Configure helmet security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.perplexity.ai", "https://*.plaid.com", "https://cdn.plaid.com", "https://placehold.co", "https://*.replit.app", "https://replit.com", "ws:", "wss:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.plaid.com", "https://*.plaid.com", "https://replit.com"],
      scriptSrcElem: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.plaid.com", "https://*.plaid.com", "https://replit.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.plaid.com", "https://oaidalleapiprodscus.blob.core.windows.net", "https://placehold.co", "https://*.githubusercontent.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      frameAncestors: ["'self'", "https://*.replit.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      workerSrc: ["'self'", "blob:", "'unsafe-inline'"],
      frameSrc: ["'self'", "https://*.plaid.com", "https://replit.com"]
    }
  },
  xssFilter: true,
  noSniff: false, // Allow proper MIME type detection for module scripts
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'sameorigin'
  },
  dnsPrefetchControl: {
    allow: false
  },
  hidePoweredBy: true
}));

// Middleware to handle module script requests
app.use((req: Request, res: Response, next: NextFunction) => {
  // Specifically handle module script requests for Vite dev mode
  if (req.path.includes('/src/main.tsx') || req.path.includes('.mjs') || req.path.includes('.js')) {
    logger.info(`[SECURITY] Allowing module script request: ${req.path}`);
    // Set the correct content type for JavaScript modules
    if (req.path.endsWith('.mjs')) {
      res.type('application/javascript+module');
    } else if (req.path.endsWith('.js')) {
      res.type('application/javascript');
    }
  }
  next();
});

// Additional security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  // X-Content-Type-Options header removed to allow proper MIME type detection for module scripts
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  // Removed since this can conflict with Helmet's CSP implementation
  // res.setHeader('X-Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  next();
});

// Configure CORS
app.use(cors({
  origin: config.clientUrl,
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
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, 
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

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

// Apply module script handling middleware
app.use(moduleScriptHandler);

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

// Initialize services
initializeServices();

// Serve our public directory for static images and other assets
app.use(express.static(path.join(process.cwd(), 'public'), {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true,
}));

// Directly serve the blog page as a fallback if the Accept header indicates the client wants HTML directly
// This will not trigger for normal SPA navigation
app.get('/blog', (req, res, next) => {
  // Check if this is likely a direct browser request (not an AJAX/SPA navigation)
  const acceptHeader = req.headers.accept || '';
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers.referer || '';
  
  // Redirect editor access to the React-based editor
  if (req.path === '/blog/editor' || req.path === '/blog/new') {
    // Let the SPA router handle this
    return next();
  }
  
  // If this appears to be a direct browser request for HTML
  // or if the ?standalone=true parameter is present
  if (
    (acceptHeader.includes('text/html') && !referer.includes('/blog')) || 
    req.query.standalone === 'true'
  ) {
    const blogHtmlPath = path.join(process.cwd(), 'public', 'blog.html');
    if (fs.existsSync(blogHtmlPath)) {
      console.log('Serving static blog HTML page as fallback');
      return res.sendFile(blogHtmlPath);
    } else {
      console.error('Blog HTML not found:', blogHtmlPath);
    }
  }
  
  // Otherwise, let the normal SPA routing handle it
  next();
});

// Serve the standalone blog editor page, but require authentication
app.get('/blog/editor/static', (req, res, next) => {
  // This would check for authentication in a real app
  // For demo, we'll check for a simple query parameter indicating logged in state
  if (req.query.auth === 'true' || req.headers.cookie?.includes('authenticated')) {
    const blogEditorPath = path.join(process.cwd(), 'public', 'blog-editor.html');
    if (fs.existsSync(blogEditorPath)) {
      console.log('Serving static blog editor HTML page');
      return res.sendFile(blogEditorPath);
    } else {
      console.error('Blog editor HTML not found:', blogEditorPath);
      return res.status(404).send('Blog editor not found');
    }
  } else {
    // Redirect to login if not authenticated
    res.redirect('/auth?returnTo=/blog/editor/static');
  }
});

// Setup routes
registerRoutes(app);

// Error handling
app.use(errorHandler);

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Create HTTP server
const httpServer = createServer(app);

// Setup routes for SPA navigation
// Bank connections route moved to combined route handler below

// Add route for the guardrails test page
app.get('/guard-test', (req, res) => {
  logger.info(`Serving Guardrails test page`);
  const testPath = path.resolve(process.cwd(), 'client', 'guard-test.html');
  if (fs.existsSync(testPath)) {
    res.sendFile(testPath);
  } else {
    logger.error(`Guardrails test page not found at: ${testPath}`);
    res.status(404).send('Test page not found');
  }
});

// Add route for the minimal Guardrails implementation
app.get('/guardrails-minimal', (req, res) => {
  logger.info(`Serving minimal Guardrails implementation`);
  const minimalPath = path.resolve(process.cwd(), 'client', 'guardrails-minimal.html');
  if (fs.existsSync(minimalPath)) {
    res.sendFile(minimalPath);
  } else {
    logger.error(`Minimal Guardrails implementation not found at: ${minimalPath}`);
    res.status(404).send('Minimal Guardrails implementation not found');
  }
});

// Add route for the guardrails feature - always serve the main index.html
app.get('/guardrails', (req, res) => {
  logger.info(`Serving Guardrails SPA route`);
  
  // Check if accept header includes text/html (browser request) vs application/javascript (module request)
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
  
  if (acceptsHtml) {
    // Browser requesting the page - send the index.html file
    const indexPath = path.resolve(process.cwd(), 'client', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      logger.error(`Index file not found at: ${indexPath}`);
      res.status(404).send('Application entry point not found');
    }
  } else {
    // This is likely a JavaScript module request, redirect to the module
    res.redirect('/src/main.tsx');
  }
});

// Add routes for other SPA pages
app.get(['/income-hub', '/income-history', '/expenses', '/bank-connections', '/profile', '/settings', '/goals'], (req, res) => {
  logger.info(`Serving SPA route for: ${req.path}`);
  // Use path.resolve to ensure proper path joining
  const indexPath = path.resolve(process.cwd(), 'client', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    logger.error(`Index file not found at: ${indexPath}`);
    res.status(404).send('Application entry point not found');
  }
});

// Fallback route for SPA navigation - needed for client-side routing
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.indexOf('/api/') === 0) {
    return next();
  }
  
  // Skip asset routes
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    return next();
  }
  
  // Send the index.html for all non-API routes
  const indexPath = path.join(process.cwd(), 'client', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});

// Start server
const PORT = parseInt(process.env.PORT || "5001", 10);

// Handle EADDRINUSE error with more graceful exit
httpServer.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Please stop any existing servers or try a different port.`);
    process.exit(1);
  }
});

// Start the server
httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} - Replit compatible`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
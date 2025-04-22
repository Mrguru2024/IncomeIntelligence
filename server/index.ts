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
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initializeAIClients } from './ai-service';
import { initializeEmailClient } from './email-service';
import { initializePerplexityService } from './services/perplexity-service';
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
      connectSrc: ["'self'", "https://api.openai.com", "https://*.plaid.com", "https://cdn.plaid.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.plaid.com", "https://*.plaid.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.plaid.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      frameSrc: ["'self'", "https://*.plaid.com"]
    }
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  dnsPrefetchControl: {
    allow: false
  },
  hidePoweredBy: true
}));

// Additional security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Security-Policy', "default-src 'self'");
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
app.get('/bank-connections', (req, res) => {
  const indexPath = path.join(process.cwd(), 'client', 'index.html');
  res.sendFile(indexPath);
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
const PORT = parseInt(process.env.PORT || "5000", 10);

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
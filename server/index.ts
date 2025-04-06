import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
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

// Load environment variables from .env file
const result = dotenv.config();
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
  console.log('Firebase Project ID from dotenv:', process.env.FIREBASE_PROJECT_ID ? "Available" : "Missing");
  console.log('Firebase Client Email from dotenv:', process.env.FIREBASE_CLIENT_EMAIL ? "Available" : "Missing");
  console.log('Firebase Private Key from dotenv:', process.env.FIREBASE_PRIVATE_KEY ? "Available (first chars: " + process.env.FIREBASE_PRIVATE_KEY.substring(0, 20) + "...)" : "Missing");
}

const app = express();

// Trust the Replit proxy
app.set('trust proxy', 1);

// Security Headers using helmet with additional security options
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://plaid.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
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

  // Global error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Handle CSRF token errors
    if (err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid or missing CSRF token'
      });
    }
    
    const status = err.status || err.statusCode || 500;
    
    // Create appropriate error response
    const errorResponse: {
      status: string;
      message: string;
      stack?: string;
      error?: any;
    } = {
      status: 'error',
      message: err.message || "Internal Server Error",
    };
    
    // Only include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
      errorResponse.error = err;
      
      // Log full error in development
      console.error('ERROR:', err);
    }
    
    // Log all 500 errors in any environment (no sensitive data)
    if (status === 500) {
      log(`SERVER ERROR: ${req.method} ${req.path} - ${err.message || 'Unknown error'}`);
    }
    
    res.status(status).json(errorResponse);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();

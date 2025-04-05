import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';

/**
 * Configure and apply security middlewares
 * @param app Express application
 */
export function setupApiProtection(app: any) {
  // Basic security headers with Helmet
  app.use(helmet());
  
  // CORS configuration
  const corsOptions: CorsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://financial-tracker.com', 'https://www.financial-tracker.com'] 
      : ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours in seconds
  };
  
  app.use(cors(corsOptions));
  
  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });
  
  // Apply rate limiting to all routes
  app.use('/api/', apiLimiter);
  
  // More strict rate limits for authentication routes
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit to 10 requests per hour
    standardHeaders: true, 
    legacyHeaders: false,
    message: 'Too many authentication attempts, please try again later'
  });
  
  // Apply stricter rate limiting to auth routes
  app.use('/api/auth/', authLimiter);
  
  // Data sanitization against XSS attacks
  app.use(xss());
  
  // Prevent HTTP Parameter Pollution
  app.use(hpp());
  
  // Data sanitization against NoSQL query injection
  // Note: We use Postgres, but this is still good practice
  app.use(mongoSanitize());
  
  // Set secure HTTP headers
  app.use(setSecurityHeaders);
  
  // Sanitize query parameters
  app.use(sanitizeQueryParams);
  
  // Prevent common API abuse patterns
  app.use(preventApiAbuse);
}

/**
 * Set additional security HTTP headers not covered by helmet
 */
export const setSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Set Strict-Transport-Security header for HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Disable iframe embedding (clickjacking protection)
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS protection in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control which features can be used in the browser
  res.setHeader('Feature-Policy', "camera 'none'; microphone 'none'; geolocation 'none'");
  
  next();
};

/**
 * Sanitize query parameters to prevent injection attacks
 */
export const sanitizeQueryParams = (req: Request, res: Response, next: NextFunction) => {
  if (req.query) {
    // Simple sanitization of query parameters
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        // Replace potentially dangerous characters
        const sanitized = (req.query[key] as string)
          .replace(/[<>]/g, '') // Remove angle brackets (potential HTML/XML)
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+=/gi, '') // Remove event handlers
          .replace(/;/g, ''); // Remove semicolons (SQL injection)
        
        req.query[key] = sanitized;
      }
    });
  }
  
  next();
};

/**
 * Detect and prevent common API abuse patterns
 */
export const preventApiAbuse = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspicious user agent
  const userAgent = req.headers['user-agent'] || '';
  
  // List of suspicious user agents (bots, scrapers, etc.)
  const suspiciousAgents = [
    'curl', 'wget', 'python-requests', 'scrapy', 'phantomjs', 'go-http-client',
    'bot', 'crawler', 'spider', 'scraper'
  ];
  
  const isSuspiciousAgent = suspiciousAgents.some(agent => 
    userAgent.toLowerCase().includes(agent)
  );
  
  // Check for automated rapid requests
  const referer = req.headers['referer'] || '';
  const isEmptyReferer = referer === '' && req.path !== '/';
  
  // Simple heuristic for potential abuse (adjust as needed)
  if (
    isSuspiciousAgent && 
    (isEmptyReferer || req.path.includes('/api/auth/'))
  ) {
    return res.status(403).json({
      message: 'Access denied. Please contact support if you believe this is an error.'
    });
  }
  
  next();
};

/**
 * Error handler middleware
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors || [err.message]
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Authentication Error',
      error: 'Invalid token or session'
    });
  }
  
  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
};

/**
 * Catch-all for unhandled routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    message: 'Resource not found',
    path: req.path
  });
};

/**
 * Log incoming requests (development only)
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
};
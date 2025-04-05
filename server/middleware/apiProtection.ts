import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to prevent API abuse by checking request properties
 */
export function preventApiAbuse(req: Request, res: Response, next: NextFunction) {
  // Check for extremely large payloads that bypass Express json limit
  const contentLength = parseInt(req.headers['content-length'] as string || '0', 10);
  if (contentLength > 1024 * 1024) { // 1MB limit
    return res.status(413).json({
      status: 'error',
      message: 'Payload too large'
    });
  }
  
  // Check for suspicious user agents
  const userAgent = req.headers['user-agent'] || '';
  const suspiciousAgents = [
    'sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab', 
    'dirbuster', 'hydra', 'gobuster', 'wpscan'
  ];
  
  if (typeof userAgent === 'string' && 
      suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied'
    });
  }
  
  // Check for suspicious request headers or parameters that might indicate scanning
  const suspiciousParams = [
    'UNION SELECT', 'INFORMATION_SCHEMA', 'VERSION()', 'DATABASE()',
    'eval(', 'exec(', 'system(', '<script>', 'javascript:',
    '../', '..\\', '/etc/passwd', 'win.ini', 'cmd.exe', 'command.com'
  ];
  
  // Check URL parameters
  const urlParams = req.url;
  if (suspiciousParams.some(param => urlParams.includes(param))) {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid request'
    });
  }
  
  // Check request body for suspicious content if it exists
  if (req.body && typeof req.body === 'object') {
    const requestBodyStr = JSON.stringify(req.body).toLowerCase();
    if (suspiciousParams.some(param => requestBodyStr.includes(param.toLowerCase()))) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid request payload'
      });
    }
  }
  
  // Check for multiple parameters with the same name (parameter pollution)
  const queryParams = Object.keys(req.query);
  const uniqueParams = new Set(queryParams);
  if (queryParams.length !== uniqueParams.size) {
    return res.status(400).json({
      status: 'error',
      message: 'Duplicate query parameters not allowed'
    });
  }
  
  next();
}

/**
 * Middleware to validate and sanitize request query parameters
 */
export function sanitizeQueryParams(req: Request, res: Response, next: NextFunction) {
  const sanitizedQuery: Record<string, any> = {};
  
  // Define allowed pattern for safe parameters
  const safePattern = /^[a-zA-Z0-9_\-., ]+$/;
  
  // Check and sanitize each query parameter
  for (const [key, value] of Object.entries(req.query)) {
    // Skip null or undefined values
    if (value === null || value === undefined) {
      continue;
    }
    
    // Handle string values
    if (typeof value === 'string') {
      // Reject values that don't match safe pattern
      if (!safePattern.test(value)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid character in query parameter: ${key}`
        });
      }
      
      // Add sanitized value
      sanitizedQuery[key] = value;
    } 
    // Handle array values
    else if (Array.isArray(value)) {
      const sanitizedArray: string[] = [];
      
      for (const item of value) {
        if (typeof item === 'string' && safePattern.test(item)) {
          sanitizedArray.push(item);
        } else {
          return res.status(400).json({
            status: 'error',
            message: `Invalid character in query parameter array: ${key}`
          });
        }
      }
      
      sanitizedQuery[key] = sanitizedArray;
    }
  }
  
  // Replace original query with sanitized one
  req.query = sanitizedQuery;
  
  next();
}

/**
 * Middleware to set secure HTTP headers
 */
export function setSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent browsers from interpreting files as a different MIME type
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable the XSS filter in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Limit referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Control document permissions
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
}
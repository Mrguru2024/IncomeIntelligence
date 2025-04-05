import crypto from 'crypto';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

// Secret key for tokens - in production this should be from environment variables
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

// Interface for token payload
interface TokenPayload {
  id: number;
  [key: string]: any;
}

/**
 * Generate a secure random token
 * @param bytes Number of bytes for the token
 * @returns Hex-encoded token string
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Hash a password using a secure algorithm
 * @param password Plain text password
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  // In a real implementation, use bcrypt with salt
  // For simplicity, using SHA-256 here
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

/**
 * Verify if a password matches its hash
 * @param plainPassword Plain text password to check
 * @param hashedPassword Stored hashed password
 * @returns Boolean indicating if password matches
 */
export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  const hash = crypto.createHash('sha256');
  hash.update(plainPassword);
  const hashedInput = hash.digest('hex');
  return hashedInput === hashedPassword;
}

/**
 * Generate a JWT token for a user
 * @param payload Data to include in the token
 * @returns JWT token string
 */
export function generateToken(payload: TokenPayload): string {
  // Use any type to work around typing issues with jwt.sign
  const jwtSecret: any = JWT_SECRET;
  return jwt.sign(payload, jwtSecret, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    // Use any type to work around typing issues with jwt.verify
    const jwtSecret: any = JWT_SECRET;
    return jwt.verify(token, jwtSecret) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Encrypt sensitive data
 * @param data Data to encrypt
 * @param key Encryption key
 * @returns Encrypted data
 */
export function encryptData(data: string, key = process.env.ENCRYPTION_KEY): string {
  if (!key) {
    throw new Error('Encryption key is required');
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Return IV + AuthTag + Encrypted data
  return iv.toString('hex') + authTag + encrypted;
}

/**
 * Decrypt encrypted data
 * @param encryptedData Encrypted data
 * @param key Encryption key
 * @returns Decrypted data
 */
export function decryptData(encryptedData: string, key = process.env.ENCRYPTION_KEY): string {
  if (!key) {
    throw new Error('Encryption key is required');
  }
  
  // Extract IV, Auth Tag and encrypted parts
  const iv = Buffer.from(encryptedData.substring(0, 32), 'hex');
  const authTag = Buffer.from(encryptedData.substring(32, 64), 'hex');
  const encryptedText = encryptedData.substring(64);
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Sanitize user input to prevent XSS attacks
 * @param input User input
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Create a content security policy nonce
 * @returns Random nonce for CSP
 */
export function generateCSPNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Validate if a string is a safe filename
 * @param filename Filename to validate
 * @returns True if filename is safe
 */
export function isValidFilename(filename: string): boolean {
  // Check for dangerous characters or patterns
  const safePattern = /^[a-zA-Z0-9_\-. ]+$/;
  return safePattern.test(filename) && !filename.includes('../');
}

/**
 * Generate a CSRF token
 * @returns CSRF token for forms
 */
export function generateCSRFToken(): string {
  return generateSecureToken(16);
}
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '443'),
  httpPort: parseInt(process.env.HTTP_PORT || '80'),
  httpsPort: parseInt(process.env.HTTPS_PORT || '443'),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'https://localhost:443',
  clientUrl: process.env.CLIENT_URL || 'https://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  plaidClientId: process.env.PLAID_CLIENT_ID,
  plaidSecret: process.env.PLAID_SECRET,
  plaidEnv: process.env.PLAID_ENV || 'sandbox',
  plaidPublicKey: process.env.PLAID_PUBLIC_KEY,
  sslCertPath: process.env.SSL_CERT_PATH || 'ssl/certificate.crt',
  sslKeyPath: process.env.SSL_KEY_PATH || 'ssl/private.key',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/income_intelligence'
}; 
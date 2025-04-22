import fs from 'fs';
import path from 'path';
import { config } from '../config';

export const getSSLConfig = () => {
  try {
    const certPath = path.resolve(process.cwd(), config.sslCertPath);
    const keyPath = path.resolve(process.cwd(), config.sslKeyPath);

    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      throw new Error('SSL certificate or key file not found');
    }

    return {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    };
  } catch (error) {
    console.error('Error loading SSL configuration:', error);
    throw error;
  }
}; 
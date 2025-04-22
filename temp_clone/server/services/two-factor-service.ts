import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { storage } from '../storage';
import { randomBytes } from 'crypto';

/**
 * Two-Factor Authentication Service
 * Handles generating, verifying, and managing 2FA
 */
export class TwoFactorService {
  /**
   * Generate a new secret for 2FA
   * @param username The username to associate with the secret
   * @returns Object containing secret and QR code data URL
   */
  async generateSecret(username: string): Promise<{ secret: string; otpAuthUrl: string; qrCodeUrl: string; }> {
    // Generate a secret using speakeasy
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `Stackr:${username}`,
      issuer: 'Stackr Finance'
    });

    // Generate QR code data URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32,
      otpAuthUrl: secret.otpauth_url || '',
      qrCodeUrl
    };
  }

  /**
   * Verify a token against a user's secret
   * @param userId User ID
   * @param token Token submitted by user
   * @returns Boolean indicating if token is valid
   */
  async verifyToken(userId: number, token: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    
    if (!user || !user.twoFactorSecret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1 // Allow a 30-second window on either side
    });
  }

  /**
   * Generate backup codes for a user
   * @param userId User ID
   * @returns Array of backup codes
   */
  async generateBackupCodes(userId: number): Promise<string[]> {
    const backupCodes: string[] = [];
    
    // Generate 10 backup codes
    for (let i = 0; i < 10; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      backupCodes.push(code);
    }
    
    // Store the backup codes for the user
    const user = await storage.getUser(userId);
    if (user) {
      await storage.updateUser(userId, {
        twoFactorBackupCodes: backupCodes
      });
    }
    
    return backupCodes;
  }

  /**
   * Verify a backup code
   * @param userId User ID
   * @param code Backup code
   * @returns Boolean indicating if code is valid
   */
  async verifyBackupCode(userId: number, code: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    
    if (!user || !user.twoFactorBackupCodes || !Array.isArray(user.twoFactorBackupCodes)) {
      return false;
    }
    
    const backupCodes = user.twoFactorBackupCodes as string[];
    const codeIndex = backupCodes.findIndex(c => c === code);
    
    if (codeIndex === -1) {
      return false;
    }
    
    // Remove the used backup code
    backupCodes.splice(codeIndex, 1);
    await storage.updateUser(userId, {
      twoFactorBackupCodes: backupCodes
    });
    
    return true;
  }

  /**
   * Enable 2FA for a user
   * @param userId User ID
   * @param secret Secret key
   * @returns Boolean indicating success
   */
  async enable2FA(userId: number, secret: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        return false;
      }
      
      // Generate backup codes
      await this.generateBackupCodes(userId);
      
      // Update user with 2FA info
      await storage.updateUser(userId, {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
        twoFactorVerified: true
      });
      
      return true;
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      return false;
    }
  }

  /**
   * Disable 2FA for a user
   * @param userId User ID
   * @returns Boolean indicating success
   */
  async disable2FA(userId: number): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        return false;
      }
      
      // Update user with 2FA info
      await storage.updateUser(userId, {
        twoFactorSecret: null,
        twoFactorEnabled: false,
        twoFactorVerified: false,
        twoFactorBackupCodes: null
      });
      
      return true;
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      return false;
    }
  }
}

export const twoFactorService = new TwoFactorService();
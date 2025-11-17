import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/env';

export interface JWTPayload {
  userId: string;
  email: string;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: string;
  email: string;
  exp: number;
}

const BCRYPT_COST = 12;
const ACCESS_TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours in seconds
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_COST);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateAccessToken(userId: string, email: string): string {
    const payload: JWTPayload = {
      userId,
      email,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY,
    };
    return jwt.sign(payload, config.JWT_SECRET, { algorithm: 'HS256' });
  }

  static generateRefreshToken(userId: string, email: string): string {
    const payload: RefreshTokenPayload = {
      userId,
      email,
      exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY,
    };
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, { algorithm: 'HS256' });
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] }) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
      }) as RefreshTokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  static isTokenExpiringSoon(token: string, thresholdHours: number = 24): boolean {
    try {
      const decoded = jwt.decode(token) as { exp?: number };
      if (!decoded || !decoded.exp) {
        return true;
      }
      const expiresAt = decoded.exp * 1000;
      const threshold = thresholdHours * 60 * 60 * 1000;
      return expiresAt - Date.now() < threshold;
    } catch {
      return true;
    }
  }
}

export class TokenBlacklist {
  private static blacklist: Set<string> = new Set();

  static add(token: string): void {
    this.blacklist.add(token);
  }

  static has(token: string): boolean {
    return this.blacklist.has(token);
  }

  static remove(token: string): void {
    this.blacklist.delete(token);
  }

  static cleanup(): void {
    // In production, this would check token expiration and remove expired tokens
    // For now, we keep all tokens until they naturally expire
  }
}

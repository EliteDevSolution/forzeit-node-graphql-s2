import jwt from 'jsonwebtoken';
import { JWTPayload, User } from '../types';
import { dataService } from '../data/dataService';

// JWT secret - in production will live in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'forzeit-dev-secret-key-not-for-production';

export class AuthService {
  
  /**
   * Verify and decode a JWT token
   * @param token JWT token string
   * @returns Decoded payload or null if invalid
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      
      if (!decoded.sub) {
        console.warn('JWT token missing sub claim');
        return null;
      }
      
      return decoded;
    } catch (error) {
      // token is invalid, expired, or malformed
      console.warn('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   * @param authHeader Authorization header value
   * @returns Token string or null
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    // Expected: "Bearer -token-"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.warn('Invalid Authorization header format');
      return null;
    }

    return parts[1];
  }

  /**
   * Get user from JWT payload
   * @param payload JWT payload
   * @returns User object or null if not found
   */
  getUserFromPayload(payload: JWTPayload): User | null {
    const user = dataService.getUserById(payload.sub);
    if (!user) {
      console.warn(`User not found for id: ${payload.sub}`);
      return null;
    }
    return user;
  }

  /**
   * Generate a JWT token for testing purposes
   * In production, this would be handled by a separate auth service
   * @param userId User ID
   * @returns JWT token
   */
  generateTestToken(userId: string): string {
    const payload: JWTPayload = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    return jwt.sign(payload, JWT_SECRET);
  }
}

export const authService = new AuthService();


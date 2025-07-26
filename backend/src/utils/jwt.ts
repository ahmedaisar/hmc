import jwt from 'jsonwebtoken';
import { prisma } from './database';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtService {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET!;
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
  private static readonly ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  static generateTokenPair(payload: JwtPayload): TokenPair {
    const accessToken = jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });
  }

  static async removeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  static async isRefreshTokenValid(token: string): Promise<boolean> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken) {
      return false;
    }

    if (storedToken.expiresAt < new Date()) {
      // Token expired, remove it
      await this.removeRefreshToken(token);
      return false;
    }

    return true;
  }

  static async removeAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  static async cleanupExpiredTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
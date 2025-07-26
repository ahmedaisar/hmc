import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/database';
import { JwtService } from '../utils/jwt';
import { validateBody } from '../middleware/validation';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { registerSchema, loginSchema } from '../utils/validation';
import { createError, conflictError, unauthorizedError } from '../middleware/errorHandler';

const router = express.Router();

// Register new user
router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw conflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'GUEST',
        isActive: true,
        isVerified: true, // In production, this should be false until email verification
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokenPair = JwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await JwtService.storeRefreshToken(user.id, tokenPair.refreshToken);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      tokens: tokenPair,
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw unauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw unauthorizedError('Account is deactivated');
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw unauthorizedError('Account is not verified');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw unauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokenPair = JwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await JwtService.storeRefreshToken(user.id, tokenPair.refreshToken);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      tokens: tokenPair,
    });
  } catch (error) {
    next(error);
  }
});

// Refresh access token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw unauthorizedError('Refresh token required');
    }

    // Verify refresh token
    const payload = JwtService.verifyRefreshToken(refreshToken);

    // Check if refresh token is valid in database
    const isValid = await JwtService.isRefreshTokenValid(refreshToken);
    if (!isValid) {
      throw unauthorizedError('Invalid or expired refresh token');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
      },
    });

    if (!user || !user.isActive || !user.isVerified) {
      throw unauthorizedError('User not found or inactive');
    }

    // Generate new tokens
    const newTokenPair = JwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove old refresh token and store new one
    await JwtService.removeRefreshToken(refreshToken);
    await JwtService.storeRefreshToken(user.id, newTokenPair.refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      tokens: newTokenPair,
    });
  } catch (error) {
    next(error);
  }
});

// Logout user
router.post('/logout', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await JwtService.removeRefreshToken(refreshToken);
    }

    // Optionally remove all refresh tokens for the user
    if (req.body.logoutAll) {
      await JwtService.removeAllUserRefreshTokens(req.user!.id);
    }

    res.json({
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        isVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      user,
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.post('/change-password', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw createError('Current password and new password are required', 400);
    }

    if (newPassword.length < 8) {
      throw createError('New password must be at least 8 characters long', 400);
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw unauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    // Remove all refresh tokens to force re-login
    await JwtService.removeAllUserRefreshTokens(user.id);

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Request password reset (placeholder - would need email service)
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError('Email is required', 400);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    // Always return success to prevent email enumeration
    res.json({
      message: 'If an account with that email exists, a password reset link has been sent',
    });

    // In production, you would:
    // 1. Generate a secure reset token
    // 2. Store it in the database with expiration
    // 3. Send email with reset link
    // 4. Implement reset password endpoint
  } catch (error) {
    next(error);
  }
});

// Verify email (placeholder)
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw createError('Verification token is required', 400);
    }

    // In production, you would:
    // 1. Verify the token
    // 2. Update user's isVerified status
    // 3. Remove the verification token

    res.json({
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
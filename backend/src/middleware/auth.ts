import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../utils/jwt';
import { prisma } from '../utils/database';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const payload = JwtService.verifyAccessToken(token);
      
      // Fetch user from database to ensure they still exist and are active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          isActive: true,
          isVerified: true,
        },
      });

      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({ error: 'Account is deactivated' });
        return;
      }

      if (!user.isVerified) {
        res.status(401).json({ error: 'Account is not verified' });
        return;
      }

      req.user = user;
      next();
    } catch (jwtError) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const payload = JwtService.verifyAccessToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          isActive: true,
          isVerified: true,
        },
      });

      if (user && user.isActive && user.isVerified) {
        req.user = user;
      }
    } catch (jwtError) {
      // Invalid token, but continue without authentication
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

export const requireHotelManager = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const hotelId = req.params.hotelId || req.body.hotelId;
    
    if (!hotelId) {
      res.status(400).json({ error: 'Hotel ID required' });
      return;
    }

    // Super admin can access any hotel
    if (req.user.role === UserRole.SUPER_ADMIN) {
      next();
      return;
    }

    // Check if user is the manager of this hotel
    if (req.user.role === UserRole.HOTEL_MANAGER) {
      const hotel = await prisma.hotel.findFirst({
        where: {
          id: hotelId,
          managerId: req.user.id,
        },
      });

      if (!hotel) {
        res.status(403).json({ error: 'Not authorized to manage this hotel' });
        return;
      }
    } else {
      res.status(403).json({ error: 'Hotel manager role required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Hotel manager authorization error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

export const requireOwnership = (resourceType: 'booking' | 'review') => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const resourceId = req.params.id;
      
      if (!resourceId) {
        res.status(400).json({ error: 'Resource ID required' });
        return;
      }

      // Super admin can access any resource
      if (req.user.role === UserRole.SUPER_ADMIN) {
        next();
        return;
      }

      let resource;
      
      switch (resourceType) {
        case 'booking':
          resource = await prisma.booking.findUnique({
            where: { id: resourceId },
            select: { userId: true },
          });
          break;
        case 'review':
          resource = await prisma.review.findUnique({
            where: { id: resourceId },
            select: { userId: true },
          });
          break;
        default:
          res.status(400).json({ error: 'Invalid resource type' });
          return;
      }

      if (!resource) {
        res.status(404).json({ error: `${resourceType} not found` });
        return;
      }

      if (resource.userId !== req.user.id) {
        res.status(403).json({ error: `Not authorized to access this ${resourceType}` });
        return;
      }

      next();
    } catch (error) {
      console.error('Ownership authorization error:', error);
      res.status(500).json({ error: 'Authorization failed' });
    }
  };
};
import express from 'express';
import { prisma } from '../utils/database';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { updateProfileSchema, paginationSchema } from '../utils/validation';
import { createError, notFoundError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res, next) => {
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
        _count: {
          select: {
            bookings: true,
            reviews: true,
            managedHotels: true,
          },
        },
      },
    });

    if (!user) {
      throw notFoundError('User');
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticate, validateBody(updateProfileSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const updateData = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
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

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
});

// Get all users (Admin only)
router.get('/', authenticate, authorize(UserRole.SUPER_ADMIN), validateQuery(paginationSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page, limit } = req.query as any;
    const { search, role, isActive } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const users = await prisma.user.findMany({
      where,
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
        _count: {
          select: {
            bookings: true,
            reviews: true,
            managedHotels: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID (Admin only)
router.get('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
        bookings: {
          select: {
            id: true,
            bookingNumber: true,
            checkIn: true,
            checkOut: true,
            total: true,
            status: true,
            hotel: {
              select: {
                name: true,
                island: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviews: {
          select: {
            id: true,
            overallRating: true,
            title: true,
            content: true,
            createdAt: true,
            hotel: {
              select: {
                name: true,
                island: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        managedHotels: {
          select: {
            id: true,
            name: true,
            island: true,
            atoll: true,
            isActive: true,
            isApproved: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
            managedHotels: true,
          },
        },
      },
    });

    if (!user) {
      throw notFoundError('User');
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user role (Admin only)
router.patch('/:id/role', authenticate, authorize(UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      throw createError('Invalid user role', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw notFoundError('User');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
      },
    });

    res.json({
      message: 'User role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// Activate/deactivate user (Admin only)
router.patch('/:id/status', authenticate, authorize(UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      throw createError('isActive must be a boolean', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw notFoundError('User');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
      },
    });

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
          },
        },
        managedHotels: true,
      },
    });

    if (!user) {
      throw notFoundError('User');
    }

    // Check if user has active bookings
    if (user.bookings.length > 0) {
      throw createError('Cannot delete user with active bookings', 400);
    }

    // Check if user manages hotels
    if (user.managedHotels.length > 0) {
      throw createError('Cannot delete user who manages hotels. Transfer hotel management first.', 400);
    }

    // Soft delete by deactivating the user
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get user statistics (Admin only)
router.get('/stats/overview', authenticate, authorize(UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      guestUsers,
      hotelManagers,
      adminUsers,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: UserRole.GUEST } }),
      prisma.user.count({ where: { role: UserRole.HOTEL_MANAGER } }),
      prisma.user.count({ where: { role: { in: [UserRole.SUPER_ADMIN] } } }),
      prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        usersByRole: {
          guests: guestUsers,
          hotelManagers,
          admins: adminUsers,
        },
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Assign hotel to manager (Admin only)
router.post('/:userId/assign-hotel/:hotelId', authenticate, authorize(UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { userId, hotelId } = req.params;

    // Check if user exists and is a hotel manager
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw notFoundError('User');
    }

    if (user.role !== UserRole.HOTEL_MANAGER) {
      throw createError('User must be a hotel manager', 400);
    }

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw notFoundError('Hotel');
    }

    // Assign hotel to manager
    const updatedHotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: { managerId: userId },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: 'Hotel assigned to manager successfully',
      hotel: updatedHotel,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
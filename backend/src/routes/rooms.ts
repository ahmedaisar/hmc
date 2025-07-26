import express from 'express';
import { prisma } from '../utils/database';
import { authenticate, authorize, requireHotelManager, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createRoomSchema, updateRoomSchema } from '../utils/validation';
import { createError, notFoundError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Get rooms for a hotel
router.get('/hotel/:hotelId', async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    const rooms = await prisma.room.findMany({
      where: {
        hotelId,
        isActive: true,
      },
      include: {
        availability: {
          where: {
            date: {
              gte: new Date(),
              lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Next 90 days
            },
          },
          orderBy: { date: 'asc' },
        },
        ratePlans: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          orderBy: { priority: 'desc' },
        },
      },
      orderBy: { basePrice: 'asc' },
    });

    res.json({ rooms });
  } catch (error) {
    next(error);
  }
});

// Get room by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            slug: true,
            island: true,
            atoll: true,
          },
        },
        availability: {
          where: {
            date: {
              gte: new Date(),
              lte: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Next 365 days
            },
          },
          orderBy: { date: 'asc' },
        },
        ratePlans: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          orderBy: { priority: 'desc' },
        },
      },
    });

    if (!room) {
      throw notFoundError('Room');
    }

    res.json({ room });
  } catch (error) {
    next(error);
  }
});

// Create new room
router.post('/', authenticate, validateBody(createRoomSchema), requireHotelManager, async (req: AuthenticatedRequest, res, next) => {
  try {
    const roomData = req.body;

    // Generate slug from name
    const slug = roomData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists for this hotel
    const existingRoom = await prisma.room.findFirst({
      where: {
        hotelId: roomData.hotelId,
        slug,
      },
    });

    if (existingRoom) {
      throw createError('Room with similar name already exists in this hotel', 409);
    }

    const room = await prisma.room.create({
      data: {
        ...roomData,
        slug,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Create initial availability for the next 365 days
    const availabilityData = [];
    const startDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      availabilityData.push({
        hotelId: room.hotelId,
        roomId: room.id,
        date,
        available: room.totalUnits,
        price: room.basePrice,
        currency: room.currency,
      });
    }

    await prisma.availability.createMany({
      data: availabilityData,
    });

    res.status(201).json({
      message: 'Room created successfully',
      room,
    });
  } catch (error) {
    next(error);
  }
});

// Update room
router.put('/:id', authenticate, validateBody(updateRoomSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingRoom = await prisma.room.findUnique({
      where: { id },
      include: { hotel: true },
    });

    if (!existingRoom) {
      throw notFoundError('Room');
    }

    // Check permissions
    if (req.user!.role === UserRole.HOTEL_MANAGER && existingRoom.hotel.managerId !== req.user!.id) {
      throw createError('Not authorized to update this room', 403);
    }

    if (req.user!.role === UserRole.GUEST) {
      throw createError('Insufficient permissions', 403);
    }

    // If name is being updated, regenerate slug
    if (updateData.name && updateData.name !== existingRoom.name) {
      const newSlug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if new slug already exists for this hotel
      const slugExists = await prisma.room.findFirst({
        where: {
          hotelId: existingRoom.hotelId,
          slug: newSlug,
          id: { not: id },
        },
      });

      if (slugExists) {
        throw createError('Room with similar name already exists in this hotel', 409);
      }

      updateData.slug = newSlug;
    }

    const room = await prisma.room.update({
      where: { id },
      data: updateData,
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    res.json({
      message: 'Room updated successfully',
      room,
    });
  } catch (error) {
    next(error);
  }
});

// Delete room
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: { hotel: true },
    });

    if (!room) {
      throw notFoundError('Room');
    }

    // Check permissions
    if (req.user!.role === UserRole.HOTEL_MANAGER && room.hotel.managerId !== req.user!.id) {
      throw createError('Not authorized to delete this room', 403);
    }

    if (req.user!.role !== UserRole.SUPER_ADMIN && req.user!.role !== UserRole.HOTEL_MANAGER) {
      throw createError('Insufficient permissions', 403);
    }

    // Check if room has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        rooms: {
          some: { roomId: id },
        },
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      },
    });

    if (activeBookings > 0) {
      throw createError('Cannot delete room with active bookings', 400);
    }

    // Soft delete by setting isActive to false
    await prisma.room.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      message: 'Room deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Create rate plan for room
router.post('/:id/rate-plans', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id: roomId } = req.params;
    const ratePlanData = req.body;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });

    if (!room) {
      throw notFoundError('Room');
    }

    // Check permissions
    if (req.user!.role === UserRole.HOTEL_MANAGER && room.hotel.managerId !== req.user!.id) {
      throw createError('Not authorized to create rate plans for this room', 403);
    }

    if (req.user!.role === UserRole.GUEST) {
      throw createError('Insufficient permissions', 403);
    }

    const ratePlan = await prisma.ratePlan.create({
      data: {
        ...ratePlanData,
        roomId,
      },
    });

    res.status(201).json({
      message: 'Rate plan created successfully',
      ratePlan,
    });
  } catch (error) {
    next(error);
  }
});

// Get rate plans for room
router.get('/:id/rate-plans', async (req, res, next) => {
  try {
    const { id: roomId } = req.params;

    const ratePlans = await prisma.ratePlan.findMany({
      where: {
        roomId,
        isActive: true,
      },
      orderBy: { priority: 'desc' },
    });

    res.json({ ratePlans });
  } catch (error) {
    next(error);
  }
});

// Update rate plan
router.put('/rate-plans/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const ratePlan = await prisma.ratePlan.findUnique({
      where: { id },
      include: {
        room: {
          include: { hotel: true },
        },
      },
    });

    if (!ratePlan) {
      throw notFoundError('Rate plan');
    }

    // Check permissions
    if (req.user!.role === UserRole.HOTEL_MANAGER && ratePlan.room.hotel.managerId !== req.user!.id) {
      throw createError('Not authorized to update this rate plan', 403);
    }

    if (req.user!.role === UserRole.GUEST) {
      throw createError('Insufficient permissions', 403);
    }

    const updatedRatePlan = await prisma.ratePlan.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Rate plan updated successfully',
      ratePlan: updatedRatePlan,
    });
  } catch (error) {
    next(error);
  }
});

// Delete rate plan
router.delete('/rate-plans/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const ratePlan = await prisma.ratePlan.findUnique({
      where: { id },
      include: {
        room: {
          include: { hotel: true },
        },
      },
    });

    if (!ratePlan) {
      throw notFoundError('Rate plan');
    }

    // Check permissions
    if (req.user!.role === UserRole.HOTEL_MANAGER && ratePlan.room.hotel.managerId !== req.user!.id) {
      throw createError('Not authorized to delete this rate plan', 403);
    }

    if (req.user!.role !== UserRole.SUPER_ADMIN && req.user!.role !== UserRole.HOTEL_MANAGER) {
      throw createError('Insufficient permissions', 403);
    }

    await prisma.ratePlan.delete({
      where: { id },
    });

    res.json({
      message: 'Rate plan deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
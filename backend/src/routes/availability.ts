import express from 'express';
import { prisma } from '../utils/database';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { validateQuery, validateBody } from '../middleware/validation';
import { availabilityQuerySchema, updateAvailabilitySchema } from '../utils/validation';
import { createError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Check availability for booking
router.get('/check', validateQuery(availabilityQuerySchema), async (req, res, next) => {
  try {
    const { hotelId, checkIn, checkOut, adults, children, rooms } = req.query as any;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    // Get hotel rooms
    const hotelRooms = await prisma.room.findMany({
      where: {
        hotelId,
        isActive: true,
      },
      include: {
        availability: {
          where: {
            date: {
              gte: checkInDate,
              lt: checkOutDate,
            },
          },
          orderBy: { date: 'asc' },
        },
        ratePlans: {
          where: {
            isActive: true,
            startDate: { lte: checkInDate },
            endDate: { gte: checkOutDate },
          },
          orderBy: { priority: 'desc' },
        },
      },
    });

    const availableRooms = hotelRooms.map(room => {
      // Check if room is available for all nights
      const isAvailable = room.availability.length === nights && 
        room.availability.every(avail => avail.available >= rooms);

      if (!isAvailable) {
        return {
          ...room,
          isAvailable: false,
          totalPrice: 0,
          pricePerNight: 0,
          availability: undefined,
        };
      }

      // Calculate pricing
      let totalPrice = 0;
      let applicableRatePlan = null;

      // Check for applicable rate plans
      for (const ratePlan of room.ratePlans) {
        if (nights >= (ratePlan.minStay || 1) && 
            (!ratePlan.maxStay || nights <= ratePlan.maxStay)) {
          applicableRatePlan = ratePlan;
          break;
        }
      }

      if (applicableRatePlan) {
        // Apply rate plan pricing
        const baseTotal = room.availability.reduce((sum, avail) => sum + avail.price, 0);
        
        if (applicableRatePlan.discount) {
          totalPrice = baseTotal * (1 - applicableRatePlan.discount / 100);
        } else if (applicableRatePlan.markup) {
          totalPrice = baseTotal * (1 + applicableRatePlan.markup / 100);
        } else {
          totalPrice = applicableRatePlan.basePrice * nights;
        }
      } else {
        // Use availability pricing
        totalPrice = room.availability.reduce((sum, avail) => sum + avail.price, 0);
      }

      return {
        ...room,
        isAvailable: true,
        totalPrice: Math.round(totalPrice * 100) / 100,
        pricePerNight: Math.round((totalPrice / nights) * 100) / 100,
        applicableRatePlan,
        availability: room.availability.map(avail => ({
          date: avail.date,
          available: avail.available,
          price: avail.price,
        })),
        ratePlans: undefined, // Remove from response
      };
    });

    res.json({
      hotelId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      adults,
      children,
      requestedRooms: rooms,
      availableRooms,
    });
  } catch (error) {
    next(error);
  }
});

// Get availability calendar for a room
router.get('/calendar/:roomId', async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date();
    const end = endDate ? new Date(endDate as string) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const availability = await prisma.availability.findMany({
      where: {
        roomId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });

    res.json({ availability });
  } catch (error) {
    next(error);
  }
});

// Update availability (Hotel Managers and Admin)
router.put('/', authenticate, authorize(UserRole.HOTEL_MANAGER, UserRole.SUPER_ADMIN), validateBody(updateAvailabilitySchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { hotelId, roomId, date, available, price, currency, minStay, maxStay, isBlocked, reason } = req.body;

    // Check permissions for hotel managers
    if (req.user!.role === UserRole.HOTEL_MANAGER) {
      const hotel = await prisma.hotel.findFirst({
        where: {
          id: hotelId,
          managerId: req.user!.id,
        },
      });

      if (!hotel) {
        throw createError('Not authorized to update availability for this hotel', 403);
      }
    }

    const dateObj = new Date(date);

    const availability = await prisma.availability.upsert({
      where: {
        hotelId_roomId_date: {
          hotelId,
          roomId,
          date: dateObj,
        },
      },
      update: {
        available,
        price,
        currency,
        minStay,
        maxStay,
        isBlocked,
        reason,
      },
      create: {
        hotelId,
        roomId,
        date: dateObj,
        available,
        price,
        currency,
        minStay,
        maxStay,
        isBlocked,
        reason,
      },
    });

    res.json({
      message: 'Availability updated successfully',
      availability,
    });
  } catch (error) {
    next(error);
  }
});

// Bulk update availability
router.put('/bulk', authenticate, authorize(UserRole.HOTEL_MANAGER, UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { hotelId, roomId, startDate, endDate, updates } = req.body;

    // Check permissions for hotel managers
    if (req.user!.role === UserRole.HOTEL_MANAGER) {
      const hotel = await prisma.hotel.findFirst({
        where: {
          id: hotelId,
          managerId: req.user!.id,
        },
      });

      if (!hotel) {
        throw createError('Not authorized to update availability for this hotel', 403);
      }
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];

    // Generate date range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(new Date(date));
    }

    // Update availability for each date
    const updatePromises = dates.map(date => 
      prisma.availability.upsert({
        where: {
          hotelId_roomId_date: {
            hotelId,
            roomId,
            date,
          },
        },
        update: updates,
        create: {
          hotelId,
          roomId,
          date,
          ...updates,
        },
      })
    );

    await Promise.all(updatePromises);

    res.json({
      message: `Availability updated for ${dates.length} dates`,
      updatedDates: dates.length,
    });
  } catch (error) {
    next(error);
  }
});

// Block/unblock dates
router.post('/block', authenticate, authorize(UserRole.HOTEL_MANAGER, UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { hotelId, roomId, startDate, endDate, isBlocked, reason } = req.body;

    // Check permissions for hotel managers
    if (req.user!.role === UserRole.HOTEL_MANAGER) {
      const hotel = await prisma.hotel.findFirst({
        where: {
          id: hotelId,
          managerId: req.user!.id,
        },
      });

      if (!hotel) {
        throw createError('Not authorized to block availability for this hotel', 403);
      }
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    await prisma.availability.updateMany({
      where: {
        hotelId,
        roomId,
        date: {
          gte: start,
          lte: end,
        },
      },
      data: {
        isBlocked,
        reason: isBlocked ? reason : null,
        available: isBlocked ? 0 : undefined,
      },
    });

    res.json({
      message: `Dates ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
    });
  } catch (error) {
    next(error);
  }
});

// Get availability statistics
router.get('/stats/:hotelId', authenticate, authorize(UserRole.HOTEL_MANAGER, UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { hotelId } = req.params;

    // Check permissions for hotel managers
    if (req.user!.role === UserRole.HOTEL_MANAGER) {
      const hotel = await prisma.hotel.findFirst({
        where: {
          id: hotelId,
          managerId: req.user!.id,
        },
      });

      if (!hotel) {
        throw createError('Not authorized to view statistics for this hotel', 403);
      }
    }

    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

    const [
      totalRooms,
      availableToday,
      bookedToday,
      blockedToday,
      avgOccupancyNextMonth,
    ] = await Promise.all([
      // Total rooms
      prisma.room.count({
        where: {
          hotelId,
          isActive: true,
        },
      }),

      // Available today
      prisma.availability.aggregate({
        where: {
          hotelId,
          date: today,
          isBlocked: false,
        },
        _sum: { available: true },
      }),

      // Booked today
      prisma.booking.count({
        where: {
          hotelId,
          checkIn: { lte: today },
          checkOut: { gt: today },
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        },
      }),

      // Blocked today
      prisma.availability.count({
        where: {
          hotelId,
          date: today,
          isBlocked: true,
        },
      }),

      // Average occupancy next month
      prisma.availability.aggregate({
        where: {
          hotelId,
          date: {
            gte: today,
            lt: nextMonth,
          },
        },
        _avg: { available: true },
      }),
    ]);

    const occupancyRate = totalRooms > 0 ? ((totalRooms - (availableToday._sum.available || 0)) / totalRooms) * 100 : 0;

    res.json({
      stats: {
        totalRooms,
        availableToday: availableToday._sum.available || 0,
        bookedToday,
        blockedToday,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        avgAvailabilityNextMonth: avgOccupancyNextMonth._avg.available || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
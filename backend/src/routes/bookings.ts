import express from 'express';
import { prisma } from '../utils/database';
import { authenticate, authorize, requireOwnership, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { createBookingSchema, updateBookingSchema, paginationSchema } from '../utils/validation';
import { createError, notFoundError } from '../middleware/errorHandler';
import { UserRole, BookingStatus, PaymentStatus } from '@prisma/client';

const router = express.Router();

// Generate booking number
function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `MHB-${timestamp}-${random}`.toUpperCase();
}

// Calculate booking total
async function calculateBookingTotal(
  rooms: Array<{ roomId: string; quantity: number }>,
  checkIn: Date,
  checkOut: Date,
  promoCode?: string
) {
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  let subtotal = 0;
  const roomDetails = [];

  for (const roomBooking of rooms) {
    const room = await prisma.room.findUnique({
      where: { id: roomBooking.roomId },
    });

    if (!room) {
      throw createError(`Room ${roomBooking.roomId} not found`, 404);
    }

    // Get availability and pricing for the date range
    const availability = await prisma.availability.findMany({
      where: {
        roomId: roomBooking.roomId,
        date: {
          gte: checkIn,
          lt: checkOut,
        },
      },
    });

    if (availability.length !== nights) {
      throw createError(`Availability data incomplete for room ${room.name}`, 400);
    }

    // Check if enough rooms are available
    const minAvailable = Math.min(...availability.map(a => a.available));
    if (minAvailable < roomBooking.quantity) {
      throw createError(`Not enough rooms available for ${room.name}`, 400);
    }

    // Calculate total for this room
    const roomTotal = availability.reduce((sum, avail) => sum + avail.price, 0) * roomBooking.quantity;
    subtotal += roomTotal;

    roomDetails.push({
      roomId: roomBooking.roomId,
      quantity: roomBooking.quantity,
      price: availability.reduce((sum, avail) => sum + avail.price, 0) / nights, // Average price per night
      total: roomTotal,
    });
  }

  // Apply promotion if provided
  let discount = 0;
  if (promoCode) {
    const promotion = await prisma.promotion.findFirst({
      where: {
        code: promoCode,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        OR: [
          { usageLimit: null },
          { usageCount: { lt: prisma.promotion.fields.usageLimit } },
        ],
      },
    });

    if (promotion) {
      if (promotion.minAmount && subtotal < promotion.minAmount) {
        throw createError(`Minimum booking amount of ${promotion.minAmount} required for this promotion`, 400);
      }

      if (promotion.minNights && nights < promotion.minNights) {
        throw createError(`Minimum ${promotion.minNights} nights required for this promotion`, 400);
      }

      switch (promotion.discountType) {
        case 'PERCENTAGE':
          discount = subtotal * (promotion.discountValue / 100);
          if (promotion.maxDiscount) {
            discount = Math.min(discount, promotion.maxDiscount);
          }
          break;
        case 'FIXED_AMOUNT':
          discount = promotion.discountValue;
          break;
        case 'FREE_NIGHTS':
          // Simplified: discount equals the value of free nights
          const avgNightlyRate = subtotal / nights;
          discount = avgNightlyRate * promotion.discountValue;
          break;
      }
    }
  }

  const taxes = subtotal * 0.12; // 12% tax (example)
  const fees = 50; // Service fee (example)
  const total = subtotal + taxes + fees - discount;

  return {
    subtotal,
    taxes,
    fees,
    discount,
    total,
    nights,
    roomDetails,
  };
}

// Get user's bookings
router.get('/my-bookings', authenticate, validateQuery(paginationSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page, limit } = req.query as any;
    const skip = (page - 1) * limit;

    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.id },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            slug: true,
            island: true,
            atoll: true,
            images: true,
          },
        },
        rooms: {
          include: {
            room: {
              select: {
                id: true,
                name: true,
                type: true,
                images: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.booking.count({
      where: { userId: req.user!.id },
    });

    res.json({
      bookings,
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

// Get booking by ID
router.get('/:id', authenticate, requireOwnership('booking'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            slug: true,
            island: true,
            atoll: true,
            images: true,
            email: true,
            phone: true,
            checkInTime: true,
            checkOutTime: true,
          },
        },
        rooms: {
          include: {
            room: {
              select: {
                id: true,
                name: true,
                type: true,
                images: true,
                amenities: true,
                capacity: true,
                view: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw notFoundError('Booking');
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

// Create new booking
router.post('/', authenticate, validateBody(createBookingSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      hotelId,
      rooms,
      checkIn,
      checkOut,
      adults,
      children,
      infants,
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      specialRequests,
      promoCode,
    } = req.body;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (checkInDate <= new Date()) {
      throw createError('Check-in date must be in the future', 400);
    }

    if (checkOutDate <= checkInDate) {
      throw createError('Check-out date must be after check-in date', 400);
    }

    // Calculate pricing and validate availability
    const calculation = await calculateBookingTotal(rooms, checkInDate, checkOutDate, promoCode);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        userId: req.user!.id,
        hotelId,
        guestFirstName,
        guestLastName,
        guestEmail,
        guestPhone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: calculation.nights,
        adults,
        children,
        infants,
        subtotal: calculation.subtotal,
        taxes: calculation.taxes,
        fees: calculation.fees,
        discount: calculation.discount,
        total: calculation.total,
        currency: 'USD',
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        specialRequests,
      },
    });

    // Create booking rooms
    await prisma.bookingRoom.createMany({
      data: calculation.roomDetails.map(room => ({
        bookingId: booking.id,
        roomId: room.roomId,
        quantity: room.quantity,
        price: room.price,
        total: room.total,
      })),
    });

    // Update availability
    for (const roomDetail of calculation.roomDetails) {
      await prisma.availability.updateMany({
        where: {
          roomId: roomDetail.roomId,
          date: {
            gte: checkInDate,
            lt: checkOutDate,
          },
        },
        data: {
          available: {
            decrement: roomDetail.quantity,
          },
        },
      });
    }

    // Update promotion usage if promo code was used
    if (promoCode) {
      await prisma.promotion.updateMany({
        where: { code: promoCode },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });
    }

    // Get complete booking data
    const completeBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
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
        rooms: {
          include: {
            room: {
              select: {
                id: true,
                name: true,
                type: true,
                images: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking: completeBooking,
    });
  } catch (error) {
    next(error);
  }
});

// Update booking
router.put('/:id', authenticate, requireOwnership('booking'), validateBody(updateBookingSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw notFoundError('Booking');
    }

    // Check if booking can be modified
    if (existingBooking.status === BookingStatus.CANCELLED) {
      throw createError('Cannot modify cancelled booking', 400);
    }

    if (existingBooking.status === BookingStatus.CHECKED_OUT) {
      throw createError('Cannot modify completed booking', 400);
    }

    // If dates are being changed, recalculate pricing
    if (updateData.checkIn || updateData.checkOut) {
      const newCheckIn = updateData.checkIn ? new Date(updateData.checkIn) : existingBooking.checkIn;
      const newCheckOut = updateData.checkOut ? new Date(updateData.checkOut) : existingBooking.checkOut;

      if (newCheckIn <= new Date()) {
        throw createError('Check-in date must be in the future', 400);
      }

      if (newCheckOut <= newCheckIn) {
        throw createError('Check-out date must be after check-in date', 400);
      }

      // For simplicity, we'll require rebooking for date changes
      throw createError('Date changes require creating a new booking', 400);
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
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
        rooms: {
          include: {
            room: {
              select: {
                id: true,
                name: true,
                type: true,
                images: true,
              },
            },
          },
        },
      },
    });

    res.json({
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.post('/:id/cancel', authenticate, requireOwnership('booking'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        rooms: true,
      },
    });

    if (!booking) {
      throw notFoundError('Booking');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw createError('Booking is already cancelled', 400);
    }

    if (booking.status === BookingStatus.CHECKED_OUT) {
      throw createError('Cannot cancel completed booking', 400);
    }

    // Calculate refund amount based on cancellation policy
    let refundAmount = 0;
    const daysToDeparture = Math.ceil((booking.checkIn.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToDeparture >= 7) {
      refundAmount = booking.total; // Full refund
    } else if (daysToDeparture >= 3) {
      refundAmount = booking.total * 0.5; // 50% refund
    }
    // No refund for cancellations within 3 days

    // Update booking
    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancellationReason: reason,
        cancelledAt: new Date(),
        refundAmount,
      },
    });

    // Restore availability
    for (const room of booking.rooms) {
      await prisma.availability.updateMany({
        where: {
          roomId: room.roomId,
          date: {
            gte: booking.checkIn,
            lt: booking.checkOut,
          },
        },
        data: {
          available: {
            increment: room.quantity,
          },
        },
      });
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking: cancelledBooking,
      refundAmount,
    });
  } catch (error) {
    next(error);
  }
});

// Get all bookings (Admin and Hotel Managers)
router.get('/manage/list', authenticate, authorize(UserRole.HOTEL_MANAGER, UserRole.SUPER_ADMIN), validateQuery(paginationSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page, limit } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Hotel managers can only see bookings for their hotels
    if (req.user!.role === UserRole.HOTEL_MANAGER) {
      const managedHotels = await prisma.hotel.findMany({
        where: { managerId: req.user!.id },
        select: { id: true },
      });
      
      where.hotelId = {
        in: managedHotels.map(hotel => hotel.id),
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
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
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        rooms: {
          include: {
            room: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.booking.count({ where });

    res.json({
      bookings,
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

// Update booking status (Hotel Managers and Admin)
router.patch('/:id/status', authenticate, authorize(UserRole.HOTEL_MANAGER, UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(BookingStatus).includes(status)) {
      throw createError('Invalid booking status', 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { hotel: true },
    });

    if (!booking) {
      throw notFoundError('Booking');
    }

    // Check permissions for hotel managers
    if (req.user!.role === UserRole.HOTEL_MANAGER && booking.hotel.managerId !== req.user!.id) {
      throw createError('Not authorized to update this booking', 403);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
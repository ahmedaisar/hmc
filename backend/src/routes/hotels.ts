import express from 'express';
import { prisma } from '../utils/database';
import { authenticate, authorize, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { createHotelSchema, updateHotelSchema, hotelQuerySchema } from '../utils/validation';
import { createError, notFoundError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Get all hotels with filtering and pagination
router.get('/', validateQuery(hotelQuerySchema), optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      page,
      limit,
      search,
      category,
      atoll,
      minPrice,
      maxPrice,
      starRating,
      amenities,
      sortBy,
      sortOrder,
    } = req.query as any;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
      isApproved: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { island: { contains: search, mode: 'insensitive' } },
        { atoll: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (atoll) {
      where.atoll = { contains: atoll, mode: 'insensitive' };
    }

    if (starRating) {
      where.starRating = starRating;
    }

    if (amenities) {
      const amenityList = amenities.split(',');
      where.amenities = {
        path: '$[*].name',
        array_contains: amenityList,
      };
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy.name = sortOrder;
        break;
      case 'rating':
        orderBy.starRating = sortOrder;
        break;
      case 'created':
        orderBy.createdAt = sortOrder;
        break;
      case 'price':
        // For price sorting, we'll need to join with rooms
        orderBy = {
          rooms: {
            _min: {
              basePrice: sortOrder,
            },
          },
        };
        break;
      default:
        orderBy.name = 'asc';
    }

    // Get hotels with room price filtering if needed
    const hotels = await prisma.hotel.findMany({
      where,
      include: {
        rooms: {
          select: {
            id: true,
            name: true,
            type: true,
            basePrice: true,
            currency: true,
            images: true,
            capacity: true,
            view: true,
          },
          where: {
            isActive: true,
            ...(minPrice || maxPrice ? {
              basePrice: {
                ...(minPrice && { gte: minPrice }),
                ...(maxPrice && { lte: maxPrice }),
              },
            } : {}),
          },
        },
        reviews: {
          select: {
            overallRating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Filter out hotels with no rooms if price filter is applied
    const filteredHotels = (minPrice || maxPrice) 
      ? hotels.filter(hotel => hotel.rooms.length > 0)
      : hotels;

    // Calculate average rating and add metadata
    const hotelsWithMetadata = filteredHotels.map(hotel => {
      const avgRating = hotel.reviews.length > 0
        ? hotel.reviews.reduce((sum, review) => sum + review.overallRating, 0) / hotel.reviews.length
        : 0;

      const minPrice = hotel.rooms.length > 0
        ? Math.min(...hotel.rooms.map(room => room.basePrice))
        : 0;

      return {
        ...hotel,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: hotel._count.reviews,
        startingPrice: minPrice,
        reviews: undefined, // Remove reviews array from response
        _count: undefined,
      };
    });

    // Get total count for pagination
    const total = await prisma.hotel.count({ where });

    res.json({
      hotels: hotelsWithMetadata,
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

// Get hotel by ID or slug
router.get('/:identifier', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is a valid CUID (ID) or treat as slug
    const isId = identifier.length === 25 && identifier.startsWith('c');
    
    const hotel = await prisma.hotel.findFirst({
      where: {
        ...(isId ? { id: identifier } : { slug: identifier }),
        isActive: true,
        isApproved: true,
      },
      include: {
        rooms: {
          where: { isActive: true },
          include: {
            availability: {
              where: {
                date: {
                  gte: new Date(),
                  lte: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Next 365 days
                },
              },
              orderBy: { date: 'asc' },
              take: 30, // Limit to next 30 days for performance
            },
          },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Latest 10 reviews
        },
        content: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        promotions: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
        manager: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            bookings: true,
          },
        },
      },
    });

    if (!hotel) {
      throw notFoundError('Hotel');
    }

    // Calculate average ratings
    const avgRating = hotel.reviews.length > 0
      ? hotel.reviews.reduce((sum, review) => sum + review.overallRating, 0) / hotel.reviews.length
      : 0;

    const avgCleanlinessRating = hotel.reviews.filter(r => r.cleanlinessRating).length > 0
      ? hotel.reviews.filter(r => r.cleanlinessRating).reduce((sum, review) => sum + (review.cleanlinessRating || 0), 0) / hotel.reviews.filter(r => r.cleanlinessRating).length
      : 0;

    const avgServiceRating = hotel.reviews.filter(r => r.serviceRating).length > 0
      ? hotel.reviews.filter(r => r.serviceRating).reduce((sum, review) => sum + (review.serviceRating || 0), 0) / hotel.reviews.filter(r => r.serviceRating).length
      : 0;

    const avgLocationRating = hotel.reviews.filter(r => r.locationRating).length > 0
      ? hotel.reviews.filter(r => r.locationRating).reduce((sum, review) => sum + (review.locationRating || 0), 0) / hotel.reviews.filter(r => r.locationRating).length
      : 0;

    const avgValueRating = hotel.reviews.filter(r => r.valueRating).length > 0
      ? hotel.reviews.filter(r => r.valueRating).reduce((sum, review) => sum + (review.valueRating || 0), 0) / hotel.reviews.filter(r => r.valueRating).length
      : 0;

    // Calculate room price range
    const roomPrices = hotel.rooms.map(room => room.basePrice);
    const priceRange = roomPrices.length > 0 ? {
      min: Math.min(...roomPrices),
      max: Math.max(...roomPrices),
    } : null;

    const hotelWithMetadata = {
      ...hotel,
      ratings: {
        overall: Math.round(avgRating * 10) / 10,
        cleanliness: Math.round(avgCleanlinessRating * 10) / 10,
        service: Math.round(avgServiceRating * 10) / 10,
        location: Math.round(avgLocationRating * 10) / 10,
        value: Math.round(avgValueRating * 10) / 10,
      },
      reviewCount: hotel._count.reviews,
      bookingCount: hotel._count.bookings,
      priceRange,
      _count: undefined,
    };

    res.json({ hotel: hotelWithMetadata });
  } catch (error) {
    next(error);
  }
});

// Create new hotel (Admin only)
router.post('/', authenticate, authorize(UserRole.SUPER_ADMIN), validateBody(createHotelSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const hotelData = req.body;

    // Generate slug from name
    const slug = hotelData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingHotel = await prisma.hotel.findUnique({
      where: { slug },
    });

    if (existingHotel) {
      throw createError('Hotel with similar name already exists', 409);
    }

    const hotel = await prisma.hotel.create({
      data: {
        ...hotelData,
        slug,
        isApproved: true, // Auto-approve when created by admin
      },
      include: {
        manager: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Hotel created successfully',
      hotel,
    });
  } catch (error) {
    next(error);
  }
});

// Update hotel
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if hotel exists
    const existingHotel = await prisma.hotel.findUnique({
      where: { id },
    });

    if (!existingHotel) {
      throw notFoundError('Hotel');
    }

    // Check permissions
    if (req.user!.role === UserRole.HOTEL_MANAGER && existingHotel.managerId !== req.user!.id) {
      throw createError('Not authorized to update this hotel', 403);
    }

    if (req.user!.role === UserRole.GUEST) {
      throw createError('Insufficient permissions', 403);
    }

    const updateData = req.body;

    // If name is being updated, regenerate slug
    if (updateData.name && updateData.name !== existingHotel.name) {
      const newSlug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if new slug already exists
      const slugExists = await prisma.hotel.findFirst({
        where: {
          slug: newSlug,
          id: { not: id },
        },
      });

      if (slugExists) {
        throw createError('Hotel with similar name already exists', 409);
      }

      updateData.slug = newSlug;
    }

    const hotel = await prisma.hotel.update({
      where: { id },
      data: updateData,
      include: {
        manager: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: 'Hotel updated successfully',
      hotel,
    });
  } catch (error) {
    next(error);
  }
});

// Delete hotel (Admin only)
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id },
    });

    if (!hotel) {
      throw notFoundError('Hotel');
    }

    // Soft delete by setting isActive to false
    await prisma.hotel.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      message: 'Hotel deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get hotels for management (Admin and Hotel Managers)
router.get('/manage/list', authenticate, authorize(UserRole.HOTEL_MANAGER, UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const where: any = {};

    // Hotel managers can only see their own hotels
    if (req.user!.role === UserRole.HOTEL_MANAGER) {
      where.managerId = req.user!.id;
    }

    const hotels = await prisma.hotel.findMany({
      where,
      include: {
        rooms: {
          select: {
            id: true,
            name: true,
            type: true,
            basePrice: true,
            totalUnits: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ hotels });
  } catch (error) {
    next(error);
  }
});

// Approve hotel (Admin only)
router.patch('/:id/approve', authenticate, authorize(UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id },
    });

    if (!hotel) {
      throw notFoundError('Hotel');
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id },
      data: { isApproved: true },
    });

    res.json({
      message: 'Hotel approved successfully',
      hotel: updatedHotel,
    });
  } catch (error) {
    next(error);
  }
});

// Get hotel analytics (Hotel Manager and Admin)
router.get('/:id/analytics', authenticate, authorize(UserRole.HOTEL_MANAGER, UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id },
    });

    if (!hotel) {
      throw notFoundError('Hotel');
    }

    // Check permissions for hotel managers
    if (req.user!.role === UserRole.HOTEL_MANAGER && hotel.managerId !== req.user!.id) {
      throw createError('Not authorized to view analytics for this hotel', 403);
    }

    // Get analytics data
    const [
      totalBookings,
      totalRevenue,
      averageRating,
      occupancyRate,
      recentBookings,
    ] = await Promise.all([
      // Total bookings
      prisma.booking.count({
        where: {
          hotelId: id,
          status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
        },
      }),

      // Total revenue
      prisma.booking.aggregate({
        where: {
          hotelId: id,
          status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
          paymentStatus: 'COMPLETED',
        },
        _sum: { total: true },
      }),

      // Average rating
      prisma.review.aggregate({
        where: {
          hotelId: id,
          isApproved: true,
        },
        _avg: { overallRating: true },
      }),

      // Occupancy rate (simplified calculation)
      prisma.booking.count({
        where: {
          hotelId: id,
          checkIn: { lte: new Date() },
          checkOut: { gte: new Date() },
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        },
      }),

      // Recent bookings
      prisma.booking.findMany({
        where: { hotelId: id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      analytics: {
        totalBookings,
        totalRevenue: totalRevenue._sum.total || 0,
        averageRating: totalRevenue._avg?.overallRating || 0,
        currentOccupancy: occupancyRate,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
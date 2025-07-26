import express from 'express';
import { prisma } from '../utils/database';
import { authenticate, authorize, requireOwnership, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { createReviewSchema, paginationSchema } from '../utils/validation';
import { createError, notFoundError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Get reviews for a hotel
router.get('/hotel/:hotelId', validateQuery(paginationSchema), async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const { page, limit } = req.query as any;
    const skip = (page - 1) * limit;

    const reviews = await prisma.review.findMany({
      where: {
        hotelId,
        isApproved: true,
      },
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
      skip,
      take: limit,
    });

    const total = await prisma.review.count({
      where: {
        hotelId,
        isApproved: true,
      },
    });

    res.json({
      reviews,
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

// Create review
router.post('/', authenticate, validateBody(createReviewSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const reviewData = req.body;

    // Check if user has stayed at the hotel
    const booking = await prisma.booking.findFirst({
      where: {
        userId: req.user!.id,
        hotelId: reviewData.hotelId,
        status: 'CHECKED_OUT',
      },
    });

    if (!booking) {
      throw createError('You can only review hotels where you have completed a stay', 400);
    }

    // Check if user already reviewed this hotel
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user!.id,
        hotelId: reviewData.hotelId,
      },
    });

    if (existingReview) {
      throw createError('You have already reviewed this hotel', 409);
    }

    const review = await prisma.review.create({
      data: {
        ...reviewData,
        userId: req.user!.id,
        isVerified: true, // Verified because user has booking
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        hotel: {
          select: {
            name: true,
            island: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
});

// Update review
router.put('/:id', authenticate, requireOwnership('review'), validateBody(createReviewSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...updateData,
        isApproved: false, // Require re-approval after edit
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        hotel: {
          select: {
            name: true,
            island: true,
          },
        },
      },
    });

    res.json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
});

// Delete review
router.delete('/:id', authenticate, requireOwnership('review'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.review.delete({
      where: { id },
    });

    res.json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Approve review (Admin only)
router.patch('/:id/approve', authenticate, authorize(UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.update({
      where: { id },
      data: {
        isApproved: true,
        moderatedBy: req.user!.id,
        moderatedAt: new Date(),
      },
    });

    res.json({
      message: 'Review approved successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
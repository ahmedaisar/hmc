import express from 'express';
import { prisma } from '../utils/database';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createPromotionSchema, updatePromotionSchema } from '../utils/validation';
import { createError, notFoundError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Get active promotions
router.get('/', async (req, res, next) => {
  try {
    const { hotelId } = req.query;

    const where: any = {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    };

    if (hotelId) {
      where.OR = [
        { hotelId },
        { hotelId: null }, // Site-wide promotions
      ];
    }

    const promotions = await prisma.promotion.findMany({
      where,
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ promotions });
  } catch (error) {
    next(error);
  }
});

// Validate promo code
router.post('/validate', async (req, res, next) => {
  try {
    const { code, hotelId, bookingAmount, nights } = req.body;

    if (!code) {
      throw createError('Promo code is required', 400);
    }

    const promotion = await prisma.promotion.findFirst({
      where: {
        code,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        OR: [
          { hotelId },
          { hotelId: null },
        ],
      },
      include: {
        hotel: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!promotion) {
      throw createError('Invalid or expired promo code', 400);
    }

    // Check usage limits
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      throw createError('Promo code usage limit exceeded', 400);
    }

    // Check minimum amount
    if (promotion.minAmount && bookingAmount < promotion.minAmount) {
      throw createError(`Minimum booking amount of ${promotion.minAmount} required`, 400);
    }

    // Check minimum nights
    if (promotion.minNights && nights < promotion.minNights) {
      throw createError(`Minimum ${promotion.minNights} nights required`, 400);
    }

    // Calculate discount
    let discountAmount = 0;
    switch (promotion.discountType) {
      case 'PERCENTAGE':
        discountAmount = bookingAmount * (promotion.discountValue / 100);
        if (promotion.maxDiscount) {
          discountAmount = Math.min(discountAmount, promotion.maxDiscount);
        }
        break;
      case 'FIXED_AMOUNT':
        discountAmount = promotion.discountValue;
        break;
      case 'FREE_NIGHTS':
        const avgNightlyRate = bookingAmount / nights;
        discountAmount = avgNightlyRate * promotion.discountValue;
        break;
    }

    res.json({
      valid: true,
      promotion: {
        id: promotion.id,
        title: promotion.title,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        discountAmount: Math.round(discountAmount * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create promotion (Admin only)
router.post('/', authenticate, authorize(UserRole.SUPER_ADMIN), validateBody(createPromotionSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const promotion = await prisma.promotion.create({
      data: req.body,
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

    res.status(201).json({
      message: 'Promotion created successfully',
      promotion,
    });
  } catch (error) {
    next(error);
  }
});

// Update promotion (Admin only)
router.put('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), validateBody(updatePromotionSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const promotion = await prisma.promotion.update({
      where: { id },
      data: req.body,
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
      message: 'Promotion updated successfully',
      promotion,
    });
  } catch (error) {
    next(error);
  }
});

// Delete promotion (Admin only)
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.promotion.delete({
      where: { id },
    });

    res.json({
      message: 'Promotion deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
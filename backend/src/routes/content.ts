import express from 'express';
import { prisma } from '../utils/database';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { createContentSchema, updateContentSchema, paginationSchema } from '../utils/validation';
import { notFoundError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Get published content
router.get('/', validateQuery(paginationSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query as any;
    const { type, language = 'en' } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
      language,
    };

    if (type) {
      where.type = type;
    }

    const content = await prisma.content.findMany({
      where,
      select: {
        id: true,
        type: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        language: true,
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.content.count({ where });

    res.json({
      content,
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

// Get content by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const content = await prisma.content.findFirst({
      where: {
        slug,
        isPublished: true,
      },
    });

    if (!content) {
      throw notFoundError('Content');
    }

    res.json({ content });
  } catch (error) {
    next(error);
  }
});

// Create content (Admin only)
router.post('/', authenticate, authorize(UserRole.SUPER_ADMIN), validateBody(createContentSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const contentData = req.body;

    // Generate slug from title
    const slug = contentData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const content = await prisma.content.create({
      data: {
        ...contentData,
        slug,
        authorId: req.user!.id,
      },
    });

    res.status(201).json({
      message: 'Content created successfully',
      content,
    });
  } catch (error) {
    next(error);
  }
});

// Update content (Admin only)
router.put('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), validateBody(updateContentSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const content = await prisma.content.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Content updated successfully',
      content,
    });
  } catch (error) {
    next(error);
  }
});

// Delete content (Admin only)
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.content.delete({
      where: { id },
    });

    res.json({
      message: 'Content deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
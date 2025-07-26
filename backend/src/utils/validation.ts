import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

// Hotel validation schemas
export const createHotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDesc: z.string().optional(),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required'),
  website: z.string().url().optional(),
  island: z.string().min(1, 'Island name is required'),
  atoll: z.string().min(1, 'Atoll name is required'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
  category: z.enum(['LUXURY_RESORT', 'BOUTIQUE_HOTEL', 'OVERWATER_VILLA', 'BEACH_RESORT', 'ECO_RESORT', 'BUDGET_HOTEL']),
  starRating: z.number().min(1).max(5),
  totalRooms: z.number().min(1),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  images: z.array(z.string().url()),
  amenities: z.array(z.object({
    name: z.string(),
    icon: z.string(),
    category: z.string(),
  })),
  facilities: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })).optional(),
  activities: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })).optional(),
  policies: z.object({
    cancellation: z.string(),
    children: z.string(),
    pets: z.string(),
    smoking: z.string(),
  }).optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export const updateHotelSchema = createHotelSchema.partial();

// Room validation schemas
export const createRoomSchema = z.object({
  hotelId: z.string().cuid('Invalid hotel ID'),
  name: z.string().min(1, 'Room name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDesc: z.string().optional(),
  type: z.enum(['BEACH_VILLA', 'OVERWATER_VILLA', 'GARDEN_VILLA', 'SUITE', 'STANDARD_ROOM', 'FAMILY_ROOM', 'PRESIDENTIAL_SUITE']),
  capacity: z.number().min(1).max(10),
  bedType: z.string().min(1, 'Bed type is required'),
  size: z.number().positive().optional(),
  view: z.string().optional(),
  basePrice: z.number().positive('Base price must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  images: z.array(z.string().url()),
  amenities: z.array(z.object({
    name: z.string(),
    icon: z.string(),
  })),
  totalUnits: z.number().min(1, 'Total units must be at least 1'),
});

export const updateRoomSchema = createRoomSchema.partial().omit({ hotelId: true });

// Booking validation schemas
export const createBookingSchema = z.object({
  hotelId: z.string().cuid('Invalid hotel ID'),
  rooms: z.array(z.object({
    roomId: z.string().cuid('Invalid room ID'),
    quantity: z.number().min(1).max(10),
  })).min(1, 'At least one room is required'),
  checkIn: z.string().datetime('Invalid check-in date'),
  checkOut: z.string().datetime('Invalid check-out date'),
  adults: z.number().min(1).max(20),
  children: z.number().min(0).max(10).default(0),
  infants: z.number().min(0).max(5).default(0),
  guestFirstName: z.string().min(1, 'Guest first name is required'),
  guestLastName: z.string().min(1, 'Guest last name is required'),
  guestEmail: z.string().email('Invalid guest email'),
  guestPhone: z.string().min(1, 'Guest phone is required'),
  specialRequests: z.string().optional(),
  promoCode: z.string().optional(),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
});

export const updateBookingSchema = z.object({
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  adults: z.number().min(1).max(20).optional(),
  children: z.number().min(0).max(10).optional(),
  infants: z.number().min(0).max(5).optional(),
  specialRequests: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW']).optional(),
});

// Review validation schemas
export const createReviewSchema = z.object({
  hotelId: z.string().cuid('Invalid hotel ID'),
  overallRating: z.number().min(1).max(5),
  cleanlinessRating: z.number().min(1).max(5).optional(),
  serviceRating: z.number().min(1).max(5).optional(),
  locationRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
  title: z.string().optional(),
  content: z.string().min(10, 'Review content must be at least 10 characters'),
  pros: z.string().optional(),
  cons: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  stayDate: z.string().datetime().optional(),
});

// Availability validation schemas
export const updateAvailabilitySchema = z.object({
  hotelId: z.string().cuid('Invalid hotel ID'),
  roomId: z.string().cuid('Invalid room ID'),
  date: z.string().datetime('Invalid date'),
  available: z.number().min(0),
  price: z.number().positive('Price must be positive'),
  currency: z.string().length(3).default('USD'),
  minStay: z.number().min(1).optional(),
  maxStay: z.number().min(1).optional(),
  isBlocked: z.boolean().default(false),
  reason: z.string().optional(),
});

// Content validation schemas
export const createContentSchema = z.object({
  type: z.enum(['PAGE', 'BLOG_POST', 'GUIDE', 'PROMOTION', 'BANNER', 'GALLERY', 'ACTIVITY', 'DINING', 'SPA']),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().optional(),
  featuredImage: z.string().url().optional(),
  gallery: z.array(z.string().url()).optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
  scheduledAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  language: z.string().length(2).default('en'),
});

export const updateContentSchema = createContentSchema.partial();

// Promotion validation schemas
export const createPromotionSchema = z.object({
  hotelId: z.string().cuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  code: z.string().min(3, 'Promo code must be at least 3 characters').optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_NIGHTS']),
  discountValue: z.number().positive('Discount value must be positive'),
  maxDiscount: z.number().positive().optional(),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  usageLimit: z.number().positive().optional(),
  userLimit: z.number().positive().optional(),
  minAmount: z.number().positive().optional(),
  minNights: z.number().min(1).optional(),
  conditions: z.record(z.any()).optional(),
  targetRoles: z.array(z.string()).optional(),
  targetUsers: z.array(z.string()).optional(),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const updatePromotionSchema = createPromotionSchema.partial();

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
});

export const hotelQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  atoll: z.string().optional(),
  minPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
  maxPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
  starRating: z.string().transform(Number).pipe(z.number().min(1).max(5)).optional(),
  amenities: z.string().optional(), // Comma-separated amenity names
  sortBy: z.enum(['name', 'price', 'rating', 'created']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const availabilityQuerySchema = z.object({
  hotelId: z.string().cuid('Invalid hotel ID'),
  checkIn: z.string().datetime('Invalid check-in date'),
  checkOut: z.string().datetime('Invalid check-out date'),
  adults: z.string().transform(Number).pipe(z.number().min(1).max(20)).default('2'),
  children: z.string().transform(Number).pipe(z.number().min(0).max(10)).default('0'),
  rooms: z.string().transform(Number).pipe(z.number().min(1).max(10)).default('1'),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
});
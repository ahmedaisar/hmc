// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'GUEST' | 'HOTEL_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Hotel types
export interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  email: string;
  phone: string;
  website?: string;
  island: string;
  atoll: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  category: HotelCategory;
  starRating: number;
  totalRooms: number;
  checkInTime: string;
  checkOutTime: string;
  images: string[];
  videos?: string[];
  amenities: Amenity[];
  facilities?: Facility[];
  activities?: Activity[];
  policies?: HotelPolicies;
  isActive: boolean;
  isApproved: boolean;
  managerId?: string;
  metaTitle?: string;
  metaDesc?: string;
  keywords?: string[];
  createdAt: string;
  updatedAt: string;
  manager?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  rooms?: Room[];
  reviews?: Review[];
  promotions?: Promotion[];
  averageRating?: number;
  reviewCount?: number;
  startingPrice?: number;
  priceRange?: {
    min: number;
    max: number;
  };
}

export type HotelCategory = 
  | 'LUXURY_RESORT'
  | 'BOUTIQUE_HOTEL'
  | 'OVERWATER_VILLA'
  | 'BEACH_RESORT'
  | 'ECO_RESORT'
  | 'BUDGET_HOTEL';

export interface Amenity {
  name: string;
  icon: string;
  category?: string;
}

export interface Facility {
  name: string;
  description: string;
}

export interface Activity {
  name: string;
  description: string;
}

export interface HotelPolicies {
  cancellation: string;
  children: string;
  pets: string;
  smoking: string;
}

// Room types
export interface Room {
  id: string;
  hotelId: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  type: RoomType;
  capacity: number;
  bedType: string;
  size?: number;
  view?: string;
  basePrice: number;
  currency: string;
  images: string[];
  amenities: Amenity[];
  totalUnits: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hotel?: {
    id: string;
    name: string;
    slug: string;
    island: string;
    atoll: string;
  };
  availability?: Availability[];
  ratePlans?: RatePlan[];
}

export type RoomType = 
  | 'BEACH_VILLA'
  | 'OVERWATER_VILLA'
  | 'GARDEN_VILLA'
  | 'SUITE'
  | 'STANDARD_ROOM'
  | 'FAMILY_ROOM'
  | 'PRESIDENTIAL_SUITE';

// Availability types
export interface Availability {
  id: string;
  hotelId: string;
  roomId: string;
  date: string;
  available: number;
  price: number;
  currency: string;
  minStay?: number;
  maxStay?: number;
  isBlocked: boolean;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

// Rate Plan types
export interface RatePlan {
  id: string;
  roomId: string;
  name: string;
  description?: string;
  basePrice: number;
  currency: string;
  startDate: string;
  endDate: string;
  minStay: number;
  maxStay?: number;
  advanceBooking?: number;
  discount?: number;
  markup?: number;
  conditions?: any;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// Booking types
export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  hotelId: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  infants: number;
  subtotal: number;
  taxes: number;
  fees: number;
  discount: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  specialRequests?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  hotel?: Hotel;
  rooms?: BookingRoom[];
  payments?: Payment[];
}

export type BookingStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';

export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface BookingRoom {
  id: string;
  bookingId: string;
  roomId: string;
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
  room?: Room;
}

// Payment types
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  stripePaymentId?: string;
  paypalOrderId?: string;
  transactionId?: string;
  gatewayResponse?: any;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
  booking?: Booking;
}

export type PaymentMethod = 
  | 'STRIPE'
  | 'PAYPAL'
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'BML';

// Review types
export interface Review {
  id: string;
  userId: string;
  hotelId: string;
  overallRating: number;
  cleanlinessRating?: number;
  serviceRating?: number;
  locationRating?: number;
  valueRating?: number;
  title?: string;
  content: string;
  pros?: string;
  cons?: string;
  images?: string[];
  isVerified: boolean;
  stayDate?: string;
  isApproved: boolean;
  moderatedBy?: string;
  moderatedAt?: string;
  helpfulVotes: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  hotel?: {
    name: string;
    island: string;
  };
}

// Promotion types
export interface Promotion {
  id: string;
  hotelId?: string;
  title: string;
  description: string;
  code?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  userLimit?: number;
  minAmount?: number;
  minNights?: number;
  conditions?: any;
  targetRoles?: string[];
  targetUsers?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hotel?: {
    id: string;
    name: string;
    slug: string;
  };
}

export type DiscountType = 
  | 'PERCENTAGE'
  | 'FIXED_AMOUNT'
  | 'FREE_NIGHTS';

// Content types
export interface Content {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  gallery?: string[];
  metaTitle?: string;
  metaDesc?: string;
  keywords?: string[];
  isPublished: boolean;
  publishedAt?: string;
  authorId?: string;
  scheduledAt?: string;
  expiresAt?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentType = 
  | 'PAGE'
  | 'BLOG_POST'
  | 'GUIDE'
  | 'PROMOTION'
  | 'BANNER'
  | 'GALLERY'
  | 'ACTIVITY'
  | 'DINING'
  | 'SPA';

// Search and filter types
export interface SearchFilters {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  category?: HotelCategory;
  atoll?: string;
  minPrice?: number;
  maxPrice?: number;
  starRating?: number;
  amenities?: string[];
  sortBy?: 'name' | 'price' | 'rating' | 'created';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AvailabilitySearch {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface BookingForm {
  hotelId: string;
  rooms: Array<{
    roomId: string;
    quantity: number;
  }>;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  promoCode?: string;
}

// Utility types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MenuItem {
  name: string;
  href: string;
  icon?: any;
  badge?: string;
  children?: MenuItem[];
}

export interface Breadcrumb {
  name: string;
  href?: string;
  current?: boolean;
}
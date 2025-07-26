// Shared types between frontend and backend

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  GUEST = 'GUEST',
  HOTEL_MANAGER = 'HOTEL_MANAGER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

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
  amenities: any[];
  isActive: boolean;
  isApproved: boolean;
  managerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum HotelCategory {
  LUXURY_RESORT = 'LUXURY_RESORT',
  BOUTIQUE_HOTEL = 'BOUTIQUE_HOTEL',
  OVERWATER_VILLA = 'OVERWATER_VILLA',
  BEACH_RESORT = 'BEACH_RESORT',
  ECO_RESORT = 'ECO_RESORT',
  BUDGET_HOTEL = 'BUDGET_HOTEL',
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  slug: string;
  description: string;
  type: RoomType;
  capacity: number;
  bedType: string;
  size?: number;
  view?: string;
  basePrice: number;
  currency: string;
  images: string[];
  amenities: any[];
  totalUnits: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum RoomType {
  BEACH_VILLA = 'BEACH_VILLA',
  OVERWATER_VILLA = 'OVERWATER_VILLA',
  GARDEN_VILLA = 'GARDEN_VILLA',
  SUITE = 'SUITE',
  STANDARD_ROOM = 'STANDARD_ROOM',
  FAMILY_ROOM = 'FAMILY_ROOM',
  PRESIDENTIAL_SUITE = 'PRESIDENTIAL_SUITE',
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  hotelId: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: Date;
  checkOut: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

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
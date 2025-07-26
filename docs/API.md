# Maldives Hotel Management API Documentation

## Overview

The Maldives Hotel Management API provides a comprehensive set of endpoints for managing hotels, bookings, users, and related resources. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

```
Development: http://localhost:3001/api
Production: https://api.maldiveshotels.com/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Refresh

Access tokens expire after 15 minutes. Use the refresh token to obtain a new access token:

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Authenticated users: 1000 requests per 15 minutes

## Error Handling

The API returns standard HTTP status codes and error responses in JSON format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "GUEST"
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### POST /auth/login
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET /auth/me
Get current user profile (requires authentication).

#### POST /auth/logout
Logout user and invalidate tokens.

### Hotels

#### GET /hotels
Get list of hotels with filtering and pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search term
- `category` - Hotel category
- `atoll` - Atoll name
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `starRating` - Star rating (1-5)
- `amenities` - Comma-separated amenity names
- `sortBy` - Sort field (name, price, rating, created)
- `sortOrder` - Sort order (asc, desc)

**Response:**
```json
{
  "hotels": [
    {
      "id": "hotel_id",
      "name": "Soneva Fushi",
      "slug": "soneva-fushi",
      "description": "Luxury eco-resort...",
      "island": "Kunfunadhoo",
      "atoll": "Baa Atoll",
      "category": "LUXURY_RESORT",
      "starRating": 5,
      "images": ["image1.jpg", "image2.jpg"],
      "averageRating": 4.8,
      "startingPrice": 2500,
      "amenities": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### GET /hotels/:id
Get hotel details by ID or slug.

#### POST /hotels
Create new hotel (Admin only).

#### PUT /hotels/:id
Update hotel (Hotel Manager/Admin).

#### DELETE /hotels/:id
Delete hotel (Admin only).

### Rooms

#### GET /rooms/hotel/:hotelId
Get rooms for a specific hotel.

#### GET /rooms/:id
Get room details by ID.

#### POST /rooms
Create new room (Hotel Manager/Admin).

#### PUT /rooms/:id
Update room (Hotel Manager/Admin).

#### DELETE /rooms/:id
Delete room (Hotel Manager/Admin).

### Bookings

#### GET /bookings/my-bookings
Get current user's bookings.

#### GET /bookings/:id
Get booking details by ID.

#### POST /bookings
Create new booking.

**Request Body:**
```json
{
  "hotelId": "hotel_id",
  "rooms": [
    {
      "roomId": "room_id",
      "quantity": 1
    }
  ],
  "checkIn": "2024-06-01T00:00:00Z",
  "checkOut": "2024-06-05T00:00:00Z",
  "adults": 2,
  "children": 0,
  "infants": 0,
  "guestFirstName": "John",
  "guestLastName": "Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+1234567890",
  "specialRequests": "Late check-in",
  "promoCode": "EARLY2024"
}
```

#### PUT /bookings/:id
Update booking.

#### POST /bookings/:id/cancel
Cancel booking.

### Availability

#### GET /availability/check
Check room availability for specific dates.

**Query Parameters:**
- `hotelId` - Hotel ID (required)
- `checkIn` - Check-in date (required)
- `checkOut` - Check-out date (required)
- `adults` - Number of adults (default: 2)
- `children` - Number of children (default: 0)
- `rooms` - Number of rooms (default: 1)

#### GET /availability/calendar/:roomId
Get availability calendar for a room.

#### PUT /availability
Update room availability (Hotel Manager/Admin).

#### PUT /availability/bulk
Bulk update availability (Hotel Manager/Admin).

### Reviews

#### GET /reviews/hotel/:hotelId
Get reviews for a hotel.

#### POST /reviews
Create new review (requires completed stay).

#### PUT /reviews/:id
Update review (owner only).

#### DELETE /reviews/:id
Delete review (owner only).

### Payments

#### POST /payments/create-intent
Create Stripe payment intent for booking.

#### POST /payments/confirm
Confirm payment completion.

#### GET /payments/history
Get user's payment history.

### Users (Admin)

#### GET /users
Get all users (Admin only).

#### GET /users/:id
Get user by ID (Admin only).

#### PATCH /users/:id/role
Update user role (Admin only).

#### PATCH /users/:id/status
Activate/deactivate user (Admin only).

### Content

#### GET /content
Get published content.

#### GET /content/:slug
Get content by slug.

#### POST /content
Create content (Admin only).

### Promotions

#### GET /promotions
Get active promotions.

#### POST /promotions/validate
Validate promo code.

#### POST /promotions
Create promotion (Admin only).

## Webhooks

### Stripe Webhook

#### POST /payments/webhook
Handle Stripe webhook events.

**Headers:**
- `stripe-signature` - Stripe signature for verification

## Data Models

### User Roles
- `GUEST` - Regular user who can make bookings
- `HOTEL_MANAGER` - Can manage assigned hotels
- `ADMIN` - Can manage users and content
- `SUPER_ADMIN` - Full system access

### Hotel Categories
- `LUXURY_RESORT`
- `BOUTIQUE_HOTEL`
- `OVERWATER_VILLA`
- `BEACH_RESORT`
- `ECO_RESORT`
- `BUDGET_HOTEL`

### Room Types
- `BEACH_VILLA`
- `OVERWATER_VILLA`
- `GARDEN_VILLA`
- `SUITE`
- `STANDARD_ROOM`
- `FAMILY_ROOM`
- `PRESIDENTIAL_SUITE`

### Booking Status
- `PENDING` - Awaiting payment
- `CONFIRMED` - Payment completed
- `CHECKED_IN` - Guest has arrived
- `CHECKED_OUT` - Stay completed
- `CANCELLED` - Booking cancelled
- `NO_SHOW` - Guest didn't arrive

### Payment Status
- `PENDING` - Payment not yet processed
- `PROCESSING` - Payment being processed
- `COMPLETED` - Payment successful
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded
- `PARTIALLY_REFUNDED` - Partial refund issued

## SDK Usage

### JavaScript/TypeScript

```typescript
import { apiClient } from './lib/api';

// Get hotels
const hotels = await apiClient.hotels.getAll({
  category: 'LUXURY_RESORT',
  atoll: 'Baa Atoll',
  page: 1,
  limit: 10
});

// Create booking
const booking = await apiClient.bookings.create({
  hotelId: 'hotel_id',
  rooms: [{ roomId: 'room_id', quantity: 1 }],
  checkIn: '2024-06-01T00:00:00Z',
  checkOut: '2024-06-05T00:00:00Z',
  adults: 2,
  children: 0,
  guestFirstName: 'John',
  guestLastName: 'Doe',
  guestEmail: 'john@example.com',
  guestPhone: '+1234567890'
});
```

## Testing

Use the provided Postman collection or test with curl:

```bash
# Get hotels
curl -X GET "http://localhost:3001/api/hotels?category=LUXURY_RESORT&limit=5"

# Login
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Support

For API support, contact:
- Email: api-support@maldiveshotels.com
- Documentation: https://docs.maldiveshotels.com
- Status Page: https://status.maldiveshotels.com
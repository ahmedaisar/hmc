# Maldives Hotel Management & Reservation System

A production-ready, scalable multi-resort hotel booking platform specifically designed for Maldives destinations.

## 🏝️ Features

### Backend (Node.js + Express + Prisma)
- **Hotel Management**: Complete CRUD operations for hotels, rooms, and amenities
- **Booking Engine**: Real-time availability checking and reservation management
- **Authentication**: JWT-based auth with role-based access control
- **Payment Integration**: Stripe integration for secure payments
- **CMS Features**: Dynamic content management for promotions and pages
- **API Security**: Rate limiting, validation, CORS protection

### Frontend (Next.js 14+ App Router)
- **SEO Optimized**: Server-side rendering for hotel pages
- **Multi-step Booking**: Intuitive booking flow with real-time pricing
- **Admin Dashboard**: Hotel management interface
- **Guest Portal**: Booking history and profile management
- **Responsive Design**: Mobile-first, accessible UI
- **Internationalization**: Multi-language support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or cloud database)
- Vercel account (for deployment)

### Local Development

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd hmc
./install.sh
```

2. **Start development servers**
```bash
./start.sh
```

### Vercel Deployment

1. **Quick deployment**
```bash
./deploy-vercel.sh
```

2. **Manual deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend && vercel --prod

# Deploy frontend
cd frontend && vercel --prod
```

3. **Using Docker (Local Development)**
```bash
docker-compose up -d
```

## 📁 Project Structure

```
hmc/
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, etc.
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   ├── prisma/              # Database schema
│   └── package.json
├── frontend/                # Next.js application
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable components
│   ├── lib/                 # Utilities
│   └── package.json
├── shared/                  # Shared types and utilities
└── docs/                    # Documentation
```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/maldives_hotels"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
REDIS_URL="redis://localhost:6379"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## 🏗️ Architecture

### Backend Architecture
- **Express.js**: RESTful API server
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Primary database
- **JWT**: Authentication and authorization
- **Stripe**: Payment processing
- **Redis**: Caching and session storage

### Frontend Architecture
- **Next.js 14**: React framework with App Router
- **Server Components**: SEO-optimized rendering
- **Tailwind CSS**: Utility-first styling
- **React Query**: Data fetching and caching
- **Zustand**: Global state management

## 📊 Database Schema

### Core Models
- **User**: Guests, hotel managers, admins
- **Hotel**: Resort properties with details
- **Room**: Room types and configurations
- **Booking**: Reservations and payments
- **Availability**: Calendar-based inventory
- **Content**: CMS pages and promotions

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- API rate limiting
- Input validation and sanitization
- CORS protection
- SQL injection prevention
- XSS protection

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Hotels
- `GET /api/hotels` - List hotels with filters
- `GET /api/hotels/:id` - Get hotel details
- `POST /api/hotels` - Create hotel (admin)
- `PUT /api/hotels/:id` - Update hotel
- `DELETE /api/hotels/:id` - Delete hotel

### Bookings
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Availability
- `GET /api/availability` - Check room availability
- `POST /api/availability` - Update availability

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel Deployment (Recommended)
```bash
# Quick deployment script
./deploy-vercel.sh

# Or manual deployment
vercel --prod
```

### Traditional Server Deployment
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Performance Optimizations

- Database indexing for fast queries
- Redis caching for frequently accessed data
- Next.js ISR for static hotel pages
- Image optimization and lazy loading
- API response compression
- CDN integration ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@maldiveshotels.com or join our Slack channel.

---

Built with ❤️ for the beautiful Maldives tourism industry.
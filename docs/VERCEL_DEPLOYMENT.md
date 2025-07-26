# Vercel Deployment Guide

This guide covers deploying the Maldives Hotel Management System to Vercel with both frontend and backend.

## 🚀 Quick Deployment

### Option 1: Deploy Both Frontend and Backend to Vercel

#### 1. Prepare Your Repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

#### 2. Deploy Backend API

1. **Create a new Vercel project for the backend**:
   ```bash
   cd backend
   vercel
   ```

2. **Configure environment variables** in Vercel dashboard:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - Strong secret for JWT tokens
   - `JWT_REFRESH_SECRET` - Strong secret for refresh tokens
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
   - `CORS_ORIGIN` - Your frontend URL

3. **Set up database** (use a cloud provider):
   - **Vercel Postgres**: Built-in PostgreSQL
   - **PlanetScale**: MySQL-compatible serverless database
   - **Supabase**: PostgreSQL with additional features
   - **Railway**: PostgreSQL hosting
   - **Neon**: Serverless PostgreSQL

#### 3. Deploy Frontend

1. **Create a new Vercel project for the frontend**:
   ```bash
   cd frontend
   vercel
   ```

2. **Configure environment variables**:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL (e.g., `https://your-backend.vercel.app/api`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
   - `NEXT_PUBLIC_APP_URL` - Your frontend URL

### Option 2: Deploy as Monorepo (Recommended)

1. **Deploy the entire project**:
   ```bash
   vercel
   ```

2. **Configure build settings** in Vercel dashboard:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `cd ../backend && npm run vercel-build && cd ../frontend && npm run build`
   - **Output Directory**: `frontend/.next`

## 🗄️ Database Setup Options

### Option 1: Vercel Postgres (Recommended)

1. **Add Vercel Postgres** to your project:
   ```bash
   vercel add postgres
   ```

2. **Get connection details** from Vercel dashboard

3. **Run migrations**:
   ```bash
   cd backend
   npx prisma db push
   npx prisma db seed
   ```

### Option 2: PlanetScale

1. **Create PlanetScale database**:
   ```bash
   # Install PlanetScale CLI
   npm install -g @planetscale/cli

   # Create database
   pscale database create maldives-hotels

   # Create branch
   pscale branch create maldives-hotels main

   # Get connection string
   pscale connect maldives-hotels main --port 3309
   ```

2. **Update DATABASE_URL**:
   ```
   DATABASE_URL="mysql://username:password@host:port/database?sslaccept=strict"
   ```

### Option 3: Supabase

1. **Create Supabase project** at https://supabase.com

2. **Get connection string** from project settings

3. **Update DATABASE_URL**:
   ```
   DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"
   ```

### Option 4: Railway

1. **Create Railway project**:
   ```bash
   npm install -g @railway/cli
   railway login
   railway new
   railway add postgresql
   ```

2. **Get connection string** from Railway dashboard

## ⚙️ Environment Variables Setup

### Backend Environment Variables

Set these in your Vercel backend project:

```env
# Database
DATABASE_URL="your_database_connection_string"

# JWT
JWT_SECRET="your-super-secret-jwt-key-256-bits-minimum"
JWT_REFRESH_SECRET="your-refresh-secret-256-bits-minimum"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Stripe
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# CORS
CORS_ORIGIN="https://your-frontend-domain.vercel.app"

# Optional
REDIS_URL="your_redis_connection_string"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Frontend Environment Variables

Set these in your Vercel frontend project:

```env
# API
NEXT_PUBLIC_API_URL="https://your-backend.vercel.app/api"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"

# App
NEXT_PUBLIC_APP_URL="https://your-frontend-domain.vercel.app"

# Optional
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

## 🔧 Build Configuration

### Backend Build Settings

In your Vercel backend project settings:

- **Framework Preset**: Other
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Frontend Build Settings

In your Vercel frontend project settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## 🌐 Custom Domains

### 1. Add Custom Domain

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

### 2. SSL Certificate

Vercel automatically provides SSL certificates for all domains.

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to your main branch.

### Preview Deployments

Every pull request gets a preview deployment URL.

### Environment-Specific Deployments

- **Production**: `main` branch
- **Preview**: Feature branches
- **Development**: Local development

## 📊 Monitoring and Analytics

### Vercel Analytics

Enable Vercel Analytics in your project settings for:
- Page views
- Performance metrics
- User analytics

### Error Monitoring

Consider integrating:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **DataDog**: Application monitoring

## 🔒 Security Configuration

### Environment Variables

- Never commit `.env` files
- Use Vercel's environment variable system
- Separate secrets for different environments

### CORS Configuration

Update CORS settings in your backend:

```typescript
app.use(cors({
  origin: [
    'https://your-domain.com',
    'https://your-domain.vercel.app',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''
  ].filter(Boolean),
  credentials: true,
}));
```

## 🚀 Deployment Commands

### Deploy Backend

```bash
cd backend
vercel --prod
```

### Deploy Frontend

```bash
cd frontend
vercel --prod
```

### Deploy Both (Monorepo)

```bash
vercel --prod
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify environment variables

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check database server accessibility
   - Ensure Prisma schema is up to date

3. **API Endpoint Issues**:
   - Verify NEXT_PUBLIC_API_URL is correct
   - Check CORS configuration
   - Ensure API routes are accessible

4. **Environment Variable Issues**:
   - Verify all required variables are set
   - Check variable names (case-sensitive)
   - Redeploy after changing variables

### Debug Commands

```bash
# Check deployment logs
vercel logs your-deployment-url

# Check build logs
vercel build --debug

# Test API endpoints
curl https://your-backend.vercel.app/api/health
```

## 📈 Performance Optimization

### Frontend Optimization

1. **Enable ISR** for hotel pages:
   ```typescript
   export const revalidate = 3600; // 1 hour
   ```

2. **Optimize images**:
   ```typescript
   import Image from 'next/image';
   
   <Image
     src="/hotel-image.jpg"
     alt="Hotel"
     width={800}
     height={600}
     priority
   />
   ```

3. **Use Edge Functions** for API routes when possible

### Backend Optimization

1. **Database Connection Pooling**:
   ```typescript
   // Use connection pooling for serverless
   const prisma = new PrismaClient({
     datasources: {
       db: {
         url: `${process.env.DATABASE_URL}?connection_limit=1`,
       },
     },
   });
   ```

2. **Optimize Cold Starts**:
   - Keep functions warm with scheduled requests
   - Minimize bundle size
   - Use edge runtime when possible

## 🎯 Production Checklist

- [ ] Database is set up and accessible
- [ ] All environment variables are configured
- [ ] Custom domain is configured
- [ ] SSL certificate is active
- [ ] CORS is properly configured
- [ ] Error monitoring is set up
- [ ] Analytics are enabled
- [ ] Performance monitoring is active
- [ ] Backup strategy is in place
- [ ] Security headers are configured

## 📞 Support

For deployment issues:
- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Project Issues**: Create an issue in your repository

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deploying-to-vercel)
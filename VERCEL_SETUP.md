# 🚀 Vercel Deployment Setup - Quick Guide

## Overview

Your Maldives Hotel Management System is now fully configured for Vercel deployment! Here's everything you need to know.

## 📁 What's Been Added

### Configuration Files
- ✅ `vercel.json` - Main project configuration
- ✅ `frontend/vercel.json` - Frontend-specific settings
- ✅ `backend/vercel.json` - Backend API configuration
- ✅ `backend/api/index.ts` - Serverless function entry point
- ✅ `deploy-vercel.sh` - Automated deployment script

### Environment Files
- ✅ `frontend/.env.production` - Production environment template
- ✅ `backend/.env.production` - Backend production template

### Updated Configurations
- ✅ `frontend/next.config.js` - Optimized for Vercel
- ✅ `backend/package.json` - Added vercel-build script
- ✅ `backend/src/index.ts` - Serverless compatibility
- ✅ `frontend/lib/api.ts` - Dynamic API URL handling

## 🚀 Deployment Options

### Option 1: Automated Deployment (Recommended)

```bash
# Make script executable and run
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

The script will guide you through:
1. Installing Vercel CLI
2. Authentication
3. Database setup options
4. Backend deployment
5. Frontend deployment
6. Environment variable configuration

### Option 2: Manual Deployment

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy Backend
```bash
cd backend
vercel --prod
```

#### Step 3: Deploy Frontend
```bash
cd frontend
vercel --prod
```

## 🗄️ Database Options

### 1. Vercel Postgres (Easiest)
```bash
vercel add postgres
```
- Automatically integrated
- No additional setup required
- Built-in connection pooling

### 2. PlanetScale (Recommended for Scale)
```bash
npm install -g @planetscale/cli
pscale database create maldives-hotels
pscale branch create maldives-hotels main
```

### 3. Supabase (Full-featured)
- Go to [supabase.com](https://supabase.com)
- Create new project
- Get connection string

### 4. Railway (Simple)
```bash
npm install -g @railway/cli
railway new
railway add postgresql
```

## ⚙️ Environment Variables

### Backend Variables (Set in Vercel Dashboard)

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-256-bit-key
JWT_REFRESH_SECRET=your-refresh-secret-256-bit-key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend Variables (Set in Vercel Dashboard)

```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
```

## 🔧 Post-Deployment Setup

### 1. Database Migration
After deploying backend with database:
```bash
# Run from your local machine
cd backend
npx prisma db push
npx prisma db seed
```

### 2. Stripe Webhook Configuration
1. Go to Stripe Dashboard
2. Add webhook endpoint: `https://your-backend.vercel.app/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to environment variables

### 3. Custom Domain (Optional)
1. Go to Vercel project settings
2. Add custom domain
3. Configure DNS records as instructed

## 📊 Monitoring

### Vercel Analytics
Enable in project settings for:
- Performance metrics
- User analytics
- Error tracking

### Error Monitoring
Consider adding:
- Sentry for error tracking
- LogRocket for session replay

## 🔒 Security Checklist

- [ ] All environment variables are set
- [ ] CORS is configured correctly
- [ ] Database has proper access controls
- [ ] Stripe webhooks are secured
- [ ] Custom domain has SSL (automatic with Vercel)

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are listed in package.json
   - Verify environment variables are set

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check if database allows external connections
   - Ensure Prisma schema is up to date

3. **API Not Working**
   - Check NEXT_PUBLIC_API_URL is correct
   - Verify CORS settings
   - Check function logs in Vercel dashboard

### Debug Commands

```bash
# Check deployment status
vercel ls

# View function logs
vercel logs your-deployment-url

# Test API endpoint
curl https://your-backend.vercel.app/api/health
```

## 📈 Performance Tips

### Frontend Optimization
- Images are automatically optimized by Vercel
- Static pages are cached at the edge
- API routes run as serverless functions

### Backend Optimization
- Use connection pooling for database
- Keep functions warm with scheduled requests
- Optimize bundle size for faster cold starts

## 🎯 Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database connected and migrated
- [ ] Environment variables configured
- [ ] Stripe webhooks configured
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled
- [ ] Error monitoring set up

## 📞 Support

### Vercel Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

### Project Resources
- `docs/VERCEL_DEPLOYMENT.md` - Detailed deployment guide
- `docs/API.md` - API documentation
- `README.md` - Project overview

## 🎉 Success!

Once deployed, your Maldives Hotel Management System will be:
- ✅ Globally distributed via Vercel's edge network
- ✅ Automatically scaled based on demand
- ✅ Secured with HTTPS
- ✅ Monitored with built-in analytics
- ✅ Ready for production traffic

Your URLs will be:
- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-backend.vercel.app/api`
- **Health Check**: `https://your-backend.vercel.app/api/health`

Happy deploying! 🏝️✨
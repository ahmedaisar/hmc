# Deployment Guide

This guide covers deploying the Maldives Hotel Management System to production environments.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+ (optional, for caching)
- Domain name with SSL certificate
- Cloud storage for images (AWS S3, Cloudinary, etc.)

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/maldives_hotels"

# JWT Secrets (generate strong secrets)
JWT_SECRET="your-super-secret-jwt-key-256-bits-minimum"
JWT_REFRESH_SECRET="your-refresh-secret-256-bits-minimum"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="production"
PORT=3001
CORS_ORIGIN="https://yourdomain.com"

# Redis (optional)
REDIS_URL="redis://username:password@host:6379"

# Stripe Payment
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@maldiveshotels.com"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH="uploads"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET="your-session-secret"

# External APIs
WEATHER_API_KEY="your-weather-api-key"
MAPS_API_KEY="your-google-maps-api-key"
```

### Frontend Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# App Configuration
NEXT_PUBLIC_APP_NAME="Maldives Hotels"
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Google Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Database Setup

### 1. Create Production Database

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE maldives_hotels;
CREATE USER maldives_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE maldives_hotels TO maldives_user;

-- Connect to the database
\c maldives_hotels;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO maldives_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO maldives_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO maldives_user;
```

### 2. Run Migrations

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 3. Seed Initial Data (Optional)

```bash
npm run db:seed
```

## Docker Deployment

### 1. Build Images

```bash
# Build backend image
cd backend
docker build -t maldives-backend .

# Build frontend image
cd ../frontend
docker build -t maldives-frontend .
```

### 2. Docker Compose Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: maldives_hotels
      POSTGRES_USER: maldives_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app_network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app_network
    restart: unless-stopped

  backend:
    image: maldives-backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://maldives_user:${POSTGRES_PASSWORD}@postgres:5432/maldives_hotels
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - app_network
    restart: unless-stopped

  frontend:
    image: maldives-frontend
    environment:
      NEXT_PUBLIC_API_URL: https://api.yourdomain.com/api
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${STRIPE_PUBLISHABLE_KEY}
    depends_on:
      - backend
    networks:
      - app_network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - app_network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  app_network:
    driver: bridge
```

### 3. Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3001;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # API Server
    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/api.yourdomain.com.crt;
        ssl_certificate_key /etc/nginx/ssl/api.yourdomain.com.key;

        location / {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Frontend Server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/yourdomain.com.crt;
        ssl_certificate_key /etc/nginx/ssl/yourdomain.com.key;

        location / {
            limit_req zone=general burst=50 nodelay;
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com api.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }
}
```

## Cloud Deployment Options

### 1. AWS Deployment

#### Using AWS ECS with Fargate

1. **Create ECR repositories**:
```bash
aws ecr create-repository --repository-name maldives-backend
aws ecr create-repository --repository-name maldives-frontend
```

2. **Push images to ECR**:
```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Tag and push images
docker tag maldives-backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/maldives-backend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/maldives-backend:latest

docker tag maldives-frontend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/maldives-frontend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/maldives-frontend:latest
```

3. **Create ECS task definitions and services**

#### Using AWS RDS for Database

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-instance-identifier maldives-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username maldives_user \
    --master-user-password your_secure_password \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxxx
```

### 2. Vercel Deployment (Frontend)

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy frontend**:
```bash
cd frontend
vercel --prod
```

3. **Configure environment variables** in Vercel dashboard

### 3. Railway Deployment

1. **Connect GitHub repository** to Railway
2. **Configure environment variables**
3. **Deploy with automatic builds**

### 4. DigitalOcean App Platform

1. **Create app specification**:
```yaml
name: maldives-hotels
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/maldives-hotels
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}

- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/maldives-hotels
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NEXT_PUBLIC_API_URL
    value: ${backend.PUBLIC_URL}/api

databases:
- name: db
  engine: PG
  version: "14"
```

## SSL Certificate Setup

### Using Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### 1. Application Monitoring

```bash
# Install PM2 for process management
npm install -g pm2

# Start applications with PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'maldives-backend',
      script: 'dist/index.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    },
    {
      name: 'maldives-frontend',
      script: 'server.js',
      cwd: './frontend',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

### 2. Database Monitoring

```sql
-- Create monitoring user
CREATE USER monitoring WITH PASSWORD 'monitoring_password';
GRANT CONNECT ON DATABASE maldives_hotels TO monitoring;
GRANT USAGE ON SCHEMA public TO monitoring;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitoring;
```

### 3. Log Aggregation

Use services like:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana + Loki**
- **DataDog**
- **New Relic**

## Backup Strategy

### 1. Database Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="maldives_hotels"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://your-backup-bucket/database/
```

### 2. File Backups

```bash
# Backup uploaded files
rsync -av /path/to/uploads/ s3://your-backup-bucket/uploads/
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_hotels_category ON hotels(category);
CREATE INDEX CONCURRENTLY idx_hotels_atoll ON hotels(atoll);
CREATE INDEX CONCURRENTLY idx_bookings_user_id ON bookings(user_id);
CREATE INDEX CONCURRENTLY idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX CONCURRENTLY idx_availability_date ON availability(date);
CREATE INDEX CONCURRENTLY idx_availability_room_date ON availability(room_id, date);

-- Analyze tables
ANALYZE;
```

### 2. Redis Caching

```javascript
// Cache frequently accessed data
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache hotel data
app.get('/api/hotels/:id', async (req, res) => {
  const cacheKey = `hotel:${req.params.id}`;
  const cached = await client.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const hotel = await getHotelById(req.params.id);
  await client.setex(cacheKey, 3600, JSON.stringify(hotel)); // Cache for 1 hour
  
  res.json(hotel);
});
```

### 3. CDN Setup

Configure CDN for static assets:
- **Cloudflare**
- **AWS CloudFront**
- **Vercel Edge Network**

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use parameterized queries
- [ ] Keep dependencies updated
- [ ] Implement proper CORS
- [ ] Use security headers
- [ ] Regular security audits
- [ ] Backup encryption
- [ ] Environment variable security

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check connection string
   - Verify network access
   - Check firewall rules

2. **Memory Issues**
   - Monitor memory usage
   - Optimize queries
   - Implement pagination

3. **Performance Issues**
   - Add database indexes
   - Implement caching
   - Optimize images

### Health Checks

```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

## Support

For deployment support:
- Email: devops@maldiveshotels.com
- Documentation: https://docs.maldiveshotels.com/deployment
- Slack: #deployment-support
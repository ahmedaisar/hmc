#!/bin/bash

# Maldives Hotel Management System - Vercel Deployment Script
# This script helps deploy the application to Vercel

set -e

echo "🏝️  Maldives Hotel Management System - Vercel Deployment"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
check_vercel_cli() {
    if command -v vercel &> /dev/null; then
        VERCEL_VERSION=$(vercel --version)
        print_success "Vercel CLI is installed: $VERCEL_VERSION"
    else
        print_error "Vercel CLI is not installed. Installing now..."
        npm install -g vercel
        print_success "Vercel CLI installed successfully"
    fi
}

# Login to Vercel
vercel_login() {
    print_status "Checking Vercel authentication..."
    if vercel whoami &> /dev/null; then
        VERCEL_USER=$(vercel whoami)
        print_success "Already logged in as: $VERCEL_USER"
    else
        print_status "Please log in to Vercel..."
        vercel login
    fi
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend to Vercel..."
    
    cd backend
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_warning "Backend .env file not found. Creating from example..."
        cp .env.example .env
        print_warning "Please update backend/.env with your production values before continuing"
        read -p "Press Enter to continue after updating .env file..."
    fi
    
    # Deploy to Vercel
    print_status "Deploying backend..."
    vercel --prod
    
    BACKEND_URL=$(vercel ls | grep maldives | head -1 | awk '{print $2}')
    print_success "Backend deployed successfully!"
    print_success "Backend URL: https://$BACKEND_URL"
    
    cd ..
    
    # Save backend URL for frontend deployment
    echo "BACKEND_URL=https://$BACKEND_URL" > .deployment-vars
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    cd frontend
    
    # Check if .env.local exists
    if [ ! -f .env.local ]; then
        print_warning "Frontend .env.local file not found. Creating from example..."
        cp .env.local.example .env.local
        
        # Update API URL if backend was deployed
        if [ -f ../.deployment-vars ]; then
            source ../.deployment-vars
            print_status "Updating API URL to: $BACKEND_URL/api"
            sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$BACKEND_URL/api|" .env.local
        fi
        
        print_warning "Please update frontend/.env.local with your production values before continuing"
        read -p "Press Enter to continue after updating .env.local file..."
    fi
    
    # Deploy to Vercel
    print_status "Deploying frontend..."
    vercel --prod
    
    FRONTEND_URL=$(vercel ls | grep maldives | head -1 | awk '{print $2}')
    print_success "Frontend deployed successfully!"
    print_success "Frontend URL: https://$FRONTEND_URL"
    
    cd ..
    
    # Save frontend URL
    echo "FRONTEND_URL=https://$FRONTEND_URL" >> .deployment-vars
}

# Deploy as monorepo
deploy_monorepo() {
    print_status "Deploying as monorepo to Vercel..."
    
    # Check if environment files exist
    if [ ! -f backend/.env ]; then
        print_warning "Backend .env file not found. Creating from example..."
        cp backend/.env.example backend/.env
    fi
    
    if [ ! -f frontend/.env.local ]; then
        print_warning "Frontend .env.local file not found. Creating from example..."
        cp frontend/.env.local.example frontend/.env.local
    fi
    
    print_warning "Please update environment files with your production values"
    print_warning "Backend: backend/.env"
    print_warning "Frontend: frontend/.env.local"
    read -p "Press Enter to continue after updating environment files..."
    
    # Deploy entire project
    print_status "Deploying monorepo..."
    vercel --prod
    
    PROJECT_URL=$(vercel ls | head -1 | awk '{print $2}')
    print_success "Project deployed successfully!"
    print_success "Project URL: https://$PROJECT_URL"
}

# Setup database
setup_database() {
    print_status "Database setup options:"
    echo "1. Vercel Postgres (Recommended)"
    echo "2. PlanetScale"
    echo "3. Supabase"
    echo "4. Railway"
    echo "5. Skip database setup"
    
    read -p "Choose an option (1-5): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            print_status "Setting up Vercel Postgres..."
            vercel add postgres
            print_success "Vercel Postgres added. Check your Vercel dashboard for connection details."
            ;;
        2)
            print_status "PlanetScale setup instructions:"
            echo "1. Install PlanetScale CLI: npm install -g @planetscale/cli"
            echo "2. Create database: pscale database create maldives-hotels"
            echo "3. Create branch: pscale branch create maldives-hotels main"
            echo "4. Get connection string from PlanetScale dashboard"
            ;;
        3)
            print_status "Supabase setup instructions:"
            echo "1. Go to https://supabase.com"
            echo "2. Create a new project"
            echo "3. Get connection string from project settings"
            ;;
        4)
            print_status "Railway setup instructions:"
            echo "1. Install Railway CLI: npm install -g @railway/cli"
            echo "2. Login: railway login"
            echo "3. Create project: railway new"
            echo "4. Add PostgreSQL: railway add postgresql"
            ;;
        5)
            print_warning "Skipping database setup"
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
}

# Configure environment variables
configure_env_vars() {
    print_status "Environment variable configuration:"
    echo ""
    echo "🔧 Required Backend Environment Variables:"
    echo "- DATABASE_URL (your database connection string)"
    echo "- JWT_SECRET (strong secret for JWT tokens)"
    echo "- JWT_REFRESH_SECRET (strong secret for refresh tokens)"
    echo "- STRIPE_SECRET_KEY (your Stripe secret key)"
    echo "- STRIPE_WEBHOOK_SECRET (your Stripe webhook secret)"
    echo "- CORS_ORIGIN (your frontend URL)"
    echo ""
    echo "🔧 Required Frontend Environment Variables:"
    echo "- NEXT_PUBLIC_API_URL (your backend API URL)"
    echo "- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (your Stripe publishable key)"
    echo "- NEXT_PUBLIC_APP_URL (your frontend URL)"
    echo ""
    echo "📝 Set these in your Vercel dashboard under Project Settings > Environment Variables"
    echo ""
    read -p "Press Enter to continue..."
}

# Main deployment process
main() {
    print_status "Starting Vercel deployment process..."
    
    # Check prerequisites
    check_vercel_cli
    vercel_login
    
    # Choose deployment strategy
    echo ""
    print_status "Choose deployment strategy:"
    echo "1. Deploy backend and frontend separately (Recommended)"
    echo "2. Deploy as monorepo"
    echo "3. Deploy backend only"
    echo "4. Deploy frontend only"
    echo "5. Setup database only"
    
    read -p "Choose an option (1-5): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            configure_env_vars
            setup_database
            deploy_backend
            deploy_frontend
            ;;
        2)
            configure_env_vars
            setup_database
            deploy_monorepo
            ;;
        3)
            configure_env_vars
            setup_database
            deploy_backend
            ;;
        4)
            configure_env_vars
            deploy_frontend
            ;;
        5)
            setup_database
            ;;
        *)
            print_error "Invalid option"
            exit 1
            ;;
    esac
    
    # Show deployment summary
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    
    if [ -f .deployment-vars ]; then
        source .deployment-vars
        echo "📋 Deployment Summary:"
        [ ! -z "$BACKEND_URL" ] && echo "- Backend API: $BACKEND_URL/api"
        [ ! -z "$FRONTEND_URL" ] && echo "- Frontend: $FRONTEND_URL"
        echo ""
    fi
    
    echo "📚 Next steps:"
    echo "1. Configure environment variables in Vercel dashboard"
    echo "2. Set up your database and run migrations"
    echo "3. Configure custom domain (optional)"
    echo "4. Set up monitoring and analytics"
    echo ""
    echo "📖 Documentation:"
    echo "- Vercel Deployment Guide: docs/VERCEL_DEPLOYMENT.md"
    echo "- API Documentation: docs/API.md"
    echo ""
    print_success "Happy deploying! 🚀"
    
    # Cleanup
    [ -f .deployment-vars ] && rm .deployment-vars
}

# Run main function
main "$@"
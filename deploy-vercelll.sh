#!/bin/bash

# Maldives Hotel Management System - Vercel Deployment Script

set -e

echo "🏝️  Maldives Hotel Management System - Vercel Deployment"
echo "========================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_vercel_cli() {
    if command -v vercel &> /dev/null; then
        VERCEL_VERSION=$(vercel --version)
        print_success "Vercel CLI is installed: $VERCEL_VERSION"
    else
        print_error "Vercel CLI not found. Installing..."
        npm install -g vercel
        print_success "Vercel CLI installed"
    fi
}

vercel_login() {
    print_status "Checking Vercel authentication..."
    if vercel whoami &> /dev/null; then
        VERCEL_USER=$(vercel whoami)
        print_success "Already logged in as: $VERCEL_USER"
    else
        vercel login
    fi
}

deploy_backend() {
    print_status "Deploying backend to Vercel..."

    if [ ! -f backend/.env ]; then
        print_warning "Backend .env not found. Creating from example..."
        cp backend/.env.example backend/.env
        print_warning "Update backend/.env with production values"
        read -p "Press Enter to continue..."
    fi

    print_status "Linking backend to Vercel project..."
    vercel link --cwd backend

    print_status "Deploying backend..."
    vercel --prod --cwd backend

    BACKEND_URL=$(vercel ls --cwd backend | grep maldives | head -1 | awk '{print $2}')
    print_success "Backend deployed successfully!"
    print_success "Backend URL: https://$BACKEND_URL"

    echo "BACKEND_URL=https://$BACKEND_URL" > .deployment-vars
}

deploy_frontend() {
    print_status "Deploying frontend to Vercel..."

    if [ ! -f frontend/.env.local ]; then
        print_warning "Frontend .env.local not found. Creating from example..."
        cp frontend/.env.local.example frontend/.env.local

        if [ -f .deployment-vars ]; then
            source .deployment-vars
            print_status "Setting NEXT_PUBLIC_API_URL to: $BACKEND_URL/api"
            sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$BACKEND_URL/api|" frontend/.env.local
        fi

        print_warning "Update frontend/.env.local with production values"
        read -p "Press Enter to continue..."
    fi

    print_status "Linking frontend to Vercel project..."
    vercel link --cwd frontend

    print_status "Deploying frontend..."
    vercel --prod --cwd frontend

    FRONTEND_URL=$(vercel ls --cwd frontend | grep maldives | head -1 | awk '{print $2}')
    print_success "Frontend deployed successfully!"
    print_success "Frontend URL: https://$FRONTEND_URL"

    echo "FRONTEND_URL=https://$FRONTEND_URL" >> .deployment-vars
}

deploy_monorepo() {
    print_status "Deploying as monorepo to Vercel..."

    [ ! -f backend/.env ] && cp backend/.env.example backend/.env
    [ ! -f frontend/.env.local ] && cp frontend/.env.local.example frontend/.env.local

    print_warning "Update backend/.env and frontend/.env.local with production values"
    read -p "Press Enter to continue..."

    print_status "Linking project..."
    vercel link

    print_status "Deploying monorepo..."
    vercel --prod

    PROJECT_URL=$(vercel ls | head -1 | awk '{print $2}')
    print_success "Project deployed successfully!"
    print_success "Project URL: https://$PROJECT_URL"
}

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
            print_success "Vercel Postgres added."
            ;;
        2)
            echo "PlanetScale steps:"
            echo "- npm install -g @planetscale/cli"
            echo "- pscale database create maldives-hotels"
            echo "- pscale branch create maldives-hotels main"
            ;;
        3)
            echo "Go to https://supabase.com and create a project"
            ;;
        4)
            echo "Railway steps:"
            echo "- npm install -g @railway/cli"
            echo "- railway login && railway new"
            ;;
        5)
            print_warning "Skipping database setup"
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
}

configure_env_vars() {
    print_status "Environment variable configuration:"
    echo
    echo "🔧 Required Backend Environment Variables:"
    echo "- DATABASE_URL"
    echo "- JWT_SECRET"
    echo "- JWT_REFRESH_SECRET"
    echo "- STRIPE_SECRET_KEY"
    echo "- STRIPE_WEBHOOK_SECRET"
    echo "- CORS_ORIGIN"
    echo
    echo "🔧 Required Frontend Environment Variables:"
    echo "- NEXT_PUBLIC_API_URL"
    echo "- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    echo "- NEXT_PUBLIC_APP_URL"
    echo
    echo "📝 Set these in Vercel dashboard > Project Settings > Environment Variables"
    echo
    read -p "Press Enter to continue..."
}

main() {
    print_status "Starting Vercel deployment process..."

    check_vercel_cli
    vercel_login

    echo
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

    echo
    echo "🎉 Deployment completed successfully!"
    echo

    if [ -f .deployment-vars ]; then
        source .deployment-vars
        echo "📋 Deployment Summary:"
        [ ! -z "$BACKEND_URL" ] && echo "- Backend API: $BACKEND_URL/api"
        [ ! -z "$FRONTEND_URL" ] && echo "- Frontend: $FRONTEND_URL"
        echo
    fi

    echo "📚 Next steps:"
    echo "1. Configure environment variables in Vercel dashboard"
    echo "2. Run database migrations"
    echo "3. Configure custom domain"
    echo "4. Set up monitoring/analytics"
    echo
    echo "📖 Documentation:"
    echo "- Vercel Guide: docs/VERCEL_DEPLOYMENT.md"
    echo "- API Docs: docs/API.md"
    echo
    print_success "Happy deploying! 🚀"

    [ -f .deployment-vars ] && rm .deployment-vars
}

main "$@"

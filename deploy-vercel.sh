#!/bin/bash

# Maldives Hotel Management System - Monorepo Vercel Deployment Script

set -e

echo "🏝️  Maldives Hotel Management System - Vercel Monorepo Deployment"
echo "================================================================="

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

configure_env_vars() {
    print_status "Required Environment Variables for Monorepo:"
    echo
    echo "🔧 Backend:"
    echo "- DATABASE_URL"
    echo "- JWT_SECRET"
    echo "- JWT_REFRESH_SECRET"
    echo "- STRIPE_SECRET_KEY"
    echo "- STRIPE_WEBHOOK_SECRET"
    echo "- CORS_ORIGIN"
    echo
    echo "🔧 Frontend:"
    echo "- NEXT_PUBLIC_API_URL"
    echo "- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    echo "- NEXT_PUBLIC_APP_URL"
    echo
    echo "📝 Set these in Vercel dashboard > Project Settings > Environment Variables"
    read -p "Press Enter to continue..."
}

setup_env_files() {
    print_status "Checking environment files..."

    [ ! -f backend/.env ] && cp backend/.env.example backend/.env && print_warning "Created backend/.env"
    [ ! -f frontend/.env.local ] && cp frontend/.env.local.example frontend/.env.local && print_warning "Created frontend/.env.local"

    print_warning "🛠️  Update your .env files with production values"
    echo "- backend/.env"
    echo "- frontend/.env.local"
    read -p "Press Enter to continue after updating..."
}

deploy_monorepo() {
    print_status "🔗 Linking monorepo root to Vercel..."
    rm -rf .vercel
    vercel link --yes

    print_status "🚀 Deploying monorepo to Vercel..."
    vercel --prod --yes

    PROJECT_URL=$(vercel ls | grep vercel.app | head -1 | awk '{print $2}')
    print_success "Monorepo deployed successfully!"
    print_success "Live URL: https://$PROJECT_URL"
}

main() {
    print_status "🌐 Starting Vercel Monorepo Deployment..."

    check_vercel_cli
    vercel_login
    configure_env_vars
    setup_env_files
    deploy_monorepo

    echo
    echo "📋 Deployment Summary:"
    echo "- Monorepo project: deployed from root with vercel.json"
    echo "- Frontend served from: /frontend"
    echo "- Backend served from: /backend via /api/* routes"
    echo
    echo "📚 Next Steps:"
    echo "1. Confirm environment variables in Vercel dashboard"
    echo "2. Run database migrations manually"
    echo "3. Connect custom domain (optional)"
    echo
    print_success "✅ Deployment completed. Happy launching! 🚀"
}

main "$@"

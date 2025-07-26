#!/bin/bash

# Maldives Hotel Management System - Installation Script
# This script sets up the development environment

set -e

echo "🏝️  Maldives Hotel Management System - Installation"
echo "=================================================="

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

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Check if PostgreSQL is available
check_postgres() {
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL client is available"
    else
        print_warning "PostgreSQL client not found. You'll need to install PostgreSQL or use a cloud database."
    fi
}

# Install root dependencies
install_root_deps() {
    print_status "Installing root dependencies..."
    npm install
    print_success "Root dependencies installed"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Copy environment file
    if [ ! -f .env ]; then
        print_status "Creating backend environment file..."
        cp .env.example .env
        print_warning "Please update backend/.env with your database credentials and other settings"
    fi
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    cd ..
    print_success "Backend setup completed"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Copy environment file
    if [ ! -f .env.local ]; then
        print_status "Creating frontend environment file..."
        cp .env.local.example .env.local
        print_warning "Please update frontend/.env.local with your API URL and other settings"
    fi
    
    cd ..
    print_success "Frontend setup completed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    read -p "Do you want to setup the database now? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd backend
        
        print_status "Running database migrations..."
        npx prisma db push
        
        read -p "Do you want to seed the database with sample data? (y/n): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Seeding database..."
            npm run db:seed
            print_success "Database seeded with sample data"
        fi
        
        cd ..
        print_success "Database setup completed"
    else
        print_warning "Skipping database setup. Run 'cd backend && npx prisma db push' when ready."
    fi
}

# Create startup scripts
create_scripts() {
    print_status "Creating startup scripts..."
    
    # Create start script
    cat > start.sh << 'EOF'
#!/bin/bash
echo "🏝️  Starting Maldives Hotel Management System..."

# Start backend
echo "Starting backend..."
cd backend && npm run dev &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "✅ System started!"
echo "📊 Backend: http://localhost:3001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
EOF

    chmod +x start.sh
    
    # Create stop script
    cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Maldives Hotel Management System..."

# Kill processes running on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo "✅ All services stopped"
EOF

    chmod +x stop.sh
    
    print_success "Startup scripts created (start.sh, stop.sh)"
}

# Main installation process
main() {
    print_status "Starting installation process..."
    
    # Check prerequisites
    check_node
    check_npm
    check_postgres
    
    # Install dependencies
    install_root_deps
    
    # Setup backend and frontend
    setup_backend
    setup_frontend
    
    # Setup database
    setup_database
    
    # Create scripts
    create_scripts
    
    echo ""
    echo "🎉 Installation completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update backend/.env with your database credentials"
    echo "2. Update frontend/.env.local with your API settings"
    echo "3. Run './start.sh' to start the development servers"
    echo ""
    echo "📚 Documentation:"
    echo "- API Documentation: docs/API.md"
    echo "- Deployment Guide: docs/DEPLOYMENT.md"
    echo "- Project README: README.md"
    echo ""
    echo "🔗 URLs (after starting):"
    echo "- Frontend: http://localhost:3000"
    echo "- Backend API: http://localhost:3001/api"
    echo "- API Health: http://localhost:3001/api/health"
    echo ""
    echo "🔑 Default login credentials (if database was seeded):"
    echo "- Admin: admin@maldiveshotels.com / admin123"
    echo "- Manager: manager@sonevaresorts.com / manager123"
    echo "- Guest: guest@example.com / guest123"
    echo ""
    print_success "Happy coding! 🚀"
}

# Run main function
main "$@"
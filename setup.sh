#!/bin/bash

# Career Preparation Platform Setup Script
echo "🚀 Setting up Career Preparation Platform..."

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
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) detected"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    print_warning "MongoDB is not running. Please start MongoDB service:"
    echo "  sudo systemctl start mongod  # Linux"
    echo "  brew services start mongodb-community  # macOS"
    read -p "Press Enter after starting MongoDB to continue..."
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
if npm install; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd client
if npm install; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# Database
MONGODB_URI=mongodb://localhost:27017/career-prep-platform

# JWT Secret (change in production)
JWT_SECRET=$(openssl rand -base64 32)

# OpenAI API (optional, for enhanced resume analysis)
OPENAI_API_KEY=your-openai-api-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Environment
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
EOF
    print_success ".env file created with default values"
else
    print_warning ".env file already exists, skipping creation"
fi

# Seed the database
print_status "Seeding database with sample data..."
if node scripts/seedData.js; then
    print_success "Database seeded successfully"
else
    print_error "Failed to seed database"
    exit 1
fi

# Final setup message
echo ""
print_success "🎉 Career Preparation Platform setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_status "Next steps:"
echo "  1. Start the development servers:"
echo "     ${BLUE}npm run dev${NC}     # Starts both backend and frontend"
echo "     ${BLUE}npm run server${NC}  # Backend only (port 5000)"
echo "     ${BLUE}npm run client${NC}  # Frontend only (port 3000)"
echo ""
echo "  2. Access the application:"
echo "     Frontend: ${BLUE}http://localhost:3000${NC}"
echo "     Backend:  ${BLUE}http://localhost:5000${NC}"
echo ""
echo "  3. Login with sample accounts:"
echo "     Admin:    ${GREEN}admin@careerprep.com${NC} / ${GREEN}admin123${NC}"
echo "     User:     ${GREEN}user@example.com${NC} / ${GREEN}user123${NC}"
echo ""
echo "  4. Optional configuration:"
echo "     - Add OpenAI API key to .env for enhanced resume analysis"
echo "     - Configure Google OAuth for social login"
echo "     - Set up email configuration for notifications"
echo ""
print_status "For production deployment, see README.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
EOF
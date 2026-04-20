#!/bin/bash

# Comprehensive Setup Script for CS625 Team1 Project (macOS)
# This script installs all dependencies and sets up the project from scratch

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
SOFT_YELLOW='\033[38;5;230m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
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

print_header() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_header "CS625 Team1 Project - Complete Setup Script"
echo "This script will install all required dependencies and set up the project."
echo ""

# Get project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

print_info "Project directory: $PROJECT_DIR"
echo ""

# Step 1: Install Homebrew
print_header "Step 1: Installing Homebrew"
if command_exists brew; then
    print_success "Homebrew is already installed"
    brew --version
else
    print_info "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == 'arm64' ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi

    print_success "Homebrew installed successfully"
fi

# Step 2: Install Python 3
print_header "Step 2: Installing Python 3"
if command_exists python3; then
    print_success "Python 3 is already installed"
    python3 --version
else
    print_info "Installing Python 3..."
    brew install python@3.14
    print_success "Python 3 installed successfully"
fi

# Step 3: Install Node.js and npm
print_header "Step 3: Installing Node.js and npm"
if command_exists node; then
    print_success "Node.js is already installed"
    node --version
    npm --version
else
    print_info "Installing Node.js..."
    brew install node
    print_success "Node.js installed successfully"
fi

# Step 4: Install Docker
print_header "Step 4: Installing Docker"
if command_exists docker; then
    print_success "Docker is already installed"
    docker --version
else
    print_info "Installing Docker Desktop..."
    brew install --cask docker
    print_warning "Docker Desktop has been installed but needs to be started manually"
    print_warning "Please open Docker Desktop from Applications, then run this script again"
    print_info "Press Enter after Docker Desktop is running..."
    read -r
fi

# Check if Docker is running
print_info "Checking if Docker is running..."
if ! docker ps >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi
print_success "Docker is running"

# Step 5: Create Python Virtual Environment
print_header "Step 5: Setting up Python Virtual Environment"
if [ -d "venv" ]; then
    print_warning "Virtual environment already exists, skipping creation"
else
    print_info "Creating virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

# Activate virtual environment
print_info "Activating virtual environment..."
source venv/bin/activate
print_success "Virtual environment activated"

# Step 6: Install Python Dependencies
print_header "Step 6: Installing Python Dependencies"
print_info "Installing backend dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt
print_success "Python dependencies installed"

# Step 7: Install Frontend Dependencies
print_header "Step 7: Installing Frontend Dependencies"
cd frontend
print_info "Installing frontend dependencies (this may take a few minutes)..."
npm install
cd ..
print_success "Frontend dependencies installed"

# Step 8: Setup Environment Files
print_header "Step 8: Setting up Environment Files"

# Backend .env
if [ ! -f ".env" ]; then
    print_info "Creating backend .env file..."
    cat > .env << 'EOF'
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=testdb
MYSQL_USER=appuser
MYSQL_PASSWORD=secret123
MYSQL_ROOT_PASSWORD=rootpassword123

# Docker MySQL Configuration
DB_CONTAINER_NAME=mysql_container
EOF
    print_success "Backend .env file created"
else
    print_warning "Backend .env file already exists, skipping"
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    print_info "Creating frontend .env.local file..."
    cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5001
EOF
    print_success "Frontend .env.local file created"
else
    print_warning "Frontend .env.local file already exists, skipping"
fi

# Step 9: Start Docker MySQL Container
print_header "Step 9: Starting MySQL Database"
print_info "Starting MySQL container..."
docker compose up -d

print_info "Waiting for MySQL to be ready (this may take 30-60 seconds)..."
sleep 10

# Wait for MySQL to be ready
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker compose logs mysql 2>&1 | grep -q "ready for connections"; then
        print_success "MySQL is ready"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done
echo ""

if [ $attempt -eq $max_attempts ]; then
    print_error "MySQL failed to start in time"
    print_info "Check logs with: docker compose logs mysql"
    exit 1
fi

# Step 10: Populate Database with Boston Reports
print_header "Step 10: Populating Database with Boston Reports"
print_info "Adding Boston-based sample reports to database..."
source venv/bin/activate
python backend/add_boston_reports.py
print_success "Database populated with sample data"

# Step 11: Test Database Connection
print_header "Step 11: Testing Database Connection"
print_info "Testing database connectivity..."
python backend/database.py
print_success "Database connection successful"

# Step 12: Create Start Script
print_header "Step 12: Creating Helper Scripts"

# Create start script
cat > start-services.sh << 'EOF'
#!/bin/bash

# Start all services for CS625 Team1 Project

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

echo "Starting CS625 Team1 Project Services..."
echo ""

# Check if Docker is running
if ! docker ps >/dev/null 2>&1; then
    echo "ERROR: Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Start MySQL
echo "Starting MySQL database..."
docker compose up -d
sleep 5

# Start Flask API in background
echo "Starting Flask API on http://localhost:5001..."
source venv/bin/activate
cd backend
nohup python api.py > /tmp/flask_api.log 2>&1 &
FLASK_PID=$!
echo "Flask API started (PID: $FLASK_PID)"
cd ..

# Wait for Flask to be ready
sleep 3

# Start Next.js Frontend in background
echo "Starting Next.js frontend on http://localhost:3000..."
cd frontend
nohup npm run dev > /tmp/nextjs.log 2>&1 &
NEXTJS_PID=$!
echo "Next.js started (PID: $NEXTJS_PID)"
cd ..

echo ""
echo "=========================================="
echo "All services started successfully!"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5001/api/reports"
echo ""
echo "To view logs:"
echo "  Flask API: tail -f /tmp/flask_api.log"
echo "  Next.js: tail -f /tmp/nextjs.log"
echo "  MySQL: docker compose logs -f mysql"
echo ""
echo "To stop services, run: ./stop-services.sh"
echo ""
EOF

chmod +x start-services.sh

# Create stop script
cat > stop-services.sh << 'EOF'
#!/bin/bash

# Stop all services for CS625 Team1 Project

echo "Stopping CS625 Team1 Project Services..."
echo ""

# Stop Flask API
echo "Stopping Flask API..."
pkill -f "python api.py" || true

# Stop Next.js
echo "Stopping Next.js..."
pkill -f "next dev" || true

# Stop MySQL (but keep data)
echo "Stopping MySQL database..."
docker compose stop

echo ""
echo "All services stopped successfully!"
echo ""
echo "To restart, run: ./start-services.sh"
echo ""
EOF

chmod +x stop-services.sh

# Create status script
cat > check-status.sh << 'EOF'
#!/bin/bash

# Check status of all services

echo "CS625 Team1 Project - Service Status"
echo "======================================"
echo ""

# Check Docker
echo "Docker:"
if docker ps >/dev/null 2>&1; then
    echo "  Status: Running"
else
    echo "  Status: Not running"
fi

# Check MySQL
echo ""
echo "MySQL Database:"
if docker ps | grep -q mysql_container; then
    echo "  Status: Running"
    echo "  Container: mysql_container"
else
    echo "  Status: Not running"
fi

# Check Flask API
echo ""
echo "Flask API:"
if pgrep -f "python api.py" >/dev/null; then
    echo "  Status: Running"
    echo "  PID: $(pgrep -f "python api.py")"
    if curl -s http://localhost:5001/api/health >/dev/null 2>&1; then
        echo "  Health: OK"
        echo "  URL: http://localhost:5001"
    else
        echo "  Health: Not responding"
    fi
else
    echo "  Status: Not running"
fi

# Check Next.js
echo ""
echo "Next.js Frontend:"
if pgrep -f "next dev" >/dev/null; then
    echo "  Status: Running"
    echo "  PID: $(pgrep -f "next dev")"
    echo "  URL: http://localhost:3000"
else
    echo "  Status: Not running"
fi

echo ""
EOF

chmod +x check-status.sh

print_success "Helper scripts created:"
print_info "  - start-services.sh: Start all services"
print_info "  - stop-services.sh: Stop all services"
print_info "  - check-status.sh: Check service status"

# Final Summary
print_header "Setup Complete"
echo ""
print_success "All dependencies were installed and configured successfully!"
echo ""
echo -e "${SOFT_YELLOW}========================================================================================================${NC}"
echo -e "${SOFT_YELLOW}[IMPORTANT] Services are not running yet. Please follow the next steps to start the application.${NC}"
echo -e "${SOFT_YELLOW}========================================================================================================${NC}"
echo ""
echo "1. Start all services:"
echo -e "   ${BLUE}./start-services.sh${NC}"
echo ""
echo "2. Open your browser to:"
echo -e "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "3. You should see a map centered on Boston with 10 report pins"
echo ""
echo "Other useful commands:"
echo -e "   Check service status: ${BLUE}./check-status.sh${NC}"
echo -e "   Stop all services: ${BLUE}./stop-services.sh${NC}"
echo -e "   View Flask logs: ${BLUE}tail -f /tmp/flask_api.log${NC}"
echo -e "   View Next.js logs: ${BLUE}tail -f /tmp/nextjs.log${NC}"
echo ""
echo "Database info:"
echo "  - Location: Docker container 'mysql_container'"
echo "  - Database: testdb"
echo "  - User: appuser"
echo "  - Password: secret123"
echo "  - Reports: 10 Boston-based sample reports"
echo ""
print_success "Setup script has completed."
echo ""

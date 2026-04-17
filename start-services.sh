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

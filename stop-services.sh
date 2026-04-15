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

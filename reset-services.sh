#!/bin/bash

set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

echo ""
echo "========================================"
echo "[RESET] Rebuilding project services and database from scratch"
echo "========================================"
echo ""

echo "Stopping existing services..."
./stop-services.sh || true

echo "Removing Docker containers and database volume..."
docker compose down -v

echo "Starting MySQL..."
docker compose up -d

echo "Waiting for MySQL to be ready..."
sleep 10

max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker compose logs mysql 2>&1 | grep -q "ready for connections"; then
        echo "MySQL is ready."
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done
echo ""

if [ $attempt -eq $max_attempts ]; then
    echo "ERROR: MySQL did not become ready in time."
    exit 1
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Applying database schema..."
docker exec -i mysql_container mysql -u appuser -psecret123 testdb < backend/init.sql

echo "Seeding sample reports..."
python backend/add_boston_reports.py

echo "Starting backend and frontend..."
./start-services.sh

echo ""
echo "========================================"
echo "[DONE] Reset complete"
echo "========================================"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5001/api/health"
echo ""
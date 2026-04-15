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
    if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
        echo "  Health: OK"
        echo "  URL: http://localhost:5000"
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

# Complete Setup Guide for CS625 Team1 Project

This guide will help you set up the entire project from scratch on macOS.

## Prerequisites

- macOS (10.15 or later)
- Internet connection
- Administrator access to install software

## Quick Start (Automated Setup)

If you have nothing installed, run this single command:

```bash
./setup-mac.sh
```

This script will:
1. Install Homebrew (if not installed)
2. Install Python 3.14
3. Install Node.js and npm
4. Install Docker Desktop
5. Create Python virtual environment
6. Install all backend dependencies
7. Install all frontend dependencies
8. Set up environment configuration files
9. Start MySQL database in Docker
10. Populate database with Boston sample data
11. Create helper scripts for starting/stopping services

**Total time: 10-15 minutes** (depending on download speeds)

## Manual Setup (Step by Step)

If you prefer to install each component manually:

### 1. Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

For Apple Silicon Macs, add to PATH:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 2. Install Python 3

```bash
brew install python@3.14
```

Verify:
```bash
python3 --version
```

### 3. Install Node.js

```bash
brew install node
```

Verify:
```bash
node --version
npm --version
```

### 4. Install Docker Desktop

```bash
brew install --cask docker
```

Then open Docker Desktop from Applications and make sure it's running.

### 5. Clone and Setup Project

```bash
cd ~/path/to/project
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

### 6. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 7. Start Database

```bash
docker compose up -d
```

Wait for MySQL to be ready (about 30-60 seconds):
```bash
docker compose logs -f mysql
# Wait for "ready for connections"
```

### 8. Populate Database

```bash
python backend/add_boston_reports.py
```

## Running the Application

### Option 1: Using Helper Scripts (Recommended)

After running the setup script, use these commands:

**Start all services:**
```bash
./start-services.sh
```

**Check service status:**
```bash
./check-status.sh
```

**Stop all services:**
```bash
./stop-services.sh
```

### Option 2: Manual Start

**Terminal 1 - Start MySQL:**
```bash
docker compose up -d
```

**Terminal 2 - Start Backend API:**
```bash
source venv/bin/activate
cd backend
python api.py
```

**Terminal 3 - Start Frontend:**
```bash
cd frontend
npm run dev
```

## Accessing the Application

Once all services are running:

- **Frontend (Main App):** http://localhost:3000
- **Backend API:** http://localhost:5000/api/reports
- **API Health Check:** http://localhost:5000/api/health

## What You Should See

When you open http://localhost:3000:

1. A map centered on Boston, MA
2. 10 pins scattered across different Boston neighborhoods
3. Pins colored by safety level:
   - Red: Critical/High priority
   - Orange: Medium priority
   - Teal: Low priority
4. Hover over any pin to see a tooltip with:
   - Report title
   - Description snippet
   - Category badge
   - Safety level badge
5. Click on pins or sidebar items to highlight them

## Sample Data Locations

The database is populated with 10 reports at these Boston locations:

1. **Downtown Boston** - Boston Common (Broken streetlight)
2. **Back Bay** - Boylston Street (Pothole)
3. **Fenway** - Near Fenway Park (Fallen tree)
4. **North End** - (Water main break)
5. **Beacon Hill** - Charles Street (Overflowing trash)
6. **South End** - Park area (Broken glass)
7. **Cambridge** - Near MIT (Bike lane damage)
8. **Seaport District** - (Seagull disturbance)
9. **Allston** - Near Boston University (Unlit crosswalk)
10. **Jamaica Plain** - Arboretum entrance (Illegal dumping)

## Troubleshooting

### Docker won't start
- Make sure Docker Desktop is running
- Try: `docker ps` to verify
- Restart Docker Desktop if needed

### Port already in use
If you see port conflicts:
- Port 3000: Another app is using it (stop it first)
- Port 5000: Another Flask app might be running
- Port 3306: Another MySQL instance might be running

### No pins showing on map
1. Check browser console for errors (F12)
2. Verify API is returning data: `curl http://localhost:5000/api/reports`
3. Make sure all services are running: `./check-status.sh`
4. Hard refresh the browser: Cmd+Shift+R

### Database connection errors
```bash
# Restart MySQL
docker compose down
docker compose up -d

# Wait for it to be ready
docker compose logs -f mysql
```

### Frontend build errors
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Python package errors
```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

## Project Structure

```
CS625_S26_Team1/
├── backend/
│   ├── api.py                    # Flask API server
│   ├── database.py               # Database manager
│   ├── add_boston_reports.py    # Script to populate Boston data
│   ├── init.sql                  # Database schema
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Main page component
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── map-background.tsx   # Map component with pins
│   │   └── trending-sidebar.tsx # Sidebar with reports
│   ├── lib/
│   │   └── api.ts               # API client functions
│   ├── .env.local               # Frontend environment config
│   └── package.json             # Node dependencies
├── .env                          # Backend environment config
├── docker-compose.yml            # Docker MySQL configuration
├── setup-mac.sh                  # Complete setup script
├── start-services.sh             # Start all services
├── stop-services.sh              # Stop all services
├── check-status.sh               # Check service status
└── README.md                     # Project documentation
```

## Development Workflow

### Making Changes

**Backend changes:**
- Edit files in `backend/`
- Restart Flask API: `pkill -f "python api.py"` then `python backend/api.py`

**Frontend changes:**
- Edit files in `frontend/`
- Changes auto-reload with hot module replacement (no restart needed)

**Database changes:**
- Modify `backend/add_boston_reports.py` to change sample data
- Run: `python backend/add_boston_reports.py`
- Refresh browser

### Adding New Reports

To add more reports to the database:

```python
from database import DatabaseManager

db = DatabaseManager()
db.connect()

# Add report (user_id, lat, lon, description, category, safety_level)
db.add_sample_report(
    1,
    42.3601,  # Latitude (Boston)
    -71.0589, # Longitude (Boston)
    "Your report description here",
    "safety",  # category: safety, maintenance, environmental, infrastructure, emergency, other
    "high"     # safety_level: low, medium, high, critical
)

db.close()
```

### Viewing Logs

```bash
# Flask API logs
tail -f /tmp/flask_api.log

# Next.js logs
tail -f /tmp/nextjs.log

# MySQL logs
docker compose logs -f mysql
```

### Database Access

To access the MySQL database directly:

```bash
docker exec -it mysql_container mysql -u appuser -p testdb
# Password: secret123
```

Common SQL commands:
```sql
-- View all reports
SELECT * FROM reports;

-- Count reports by category
SELECT category, COUNT(*) FROM reports GROUP BY category;

-- View reports with user info
SELECT r.*, u.username FROM reports r JOIN users u ON r.user_id = u.id;

-- Delete all reports
DELETE FROM reports;
```

## Updating Dependencies

### Backend (Python)
```bash
source venv/bin/activate
pip install --upgrade package-name
pip freeze > backend/requirements.txt
```

### Frontend (Node.js)
```bash
cd frontend
npm update
npm install package-name@latest
```

## Cleanup

To completely remove everything and start fresh:

```bash
# Stop all services
./stop-services.sh

# Remove Docker containers and volumes
docker compose down -v

# Remove virtual environment
rm -rf venv

# Remove node_modules
rm -rf frontend/node_modules

# Remove log files
rm -f /tmp/flask_api.log /tmp/nextjs.log

# Then run setup again
./setup-mac.sh
```

## Getting Help

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Run `./check-status.sh` to see what's running
3. Check the logs (see Viewing Logs section)
4. Make sure all prerequisites are installed
5. Try the cleanup steps and setup again

## Next Steps

After successful setup:

1. Explore the map and test the features
2. Try adding your own reports via the API
3. Customize the frontend components
4. Add new API endpoints for additional features
5. Modify the database schema for new data fields

## Resources

- Flask Documentation: https://flask.palletsprojects.com/
- Next.js Documentation: https://nextjs.org/docs
- Leaflet (Map Library): https://leafletjs.com/
- MySQL Documentation: https://dev.mysql.com/doc/
- Docker Documentation: https://docs.docker.com/

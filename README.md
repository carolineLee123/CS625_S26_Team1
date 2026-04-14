# CS625_S26_Team1
Real-Time Community Updates

## Project Status

This project currently contains both a backend and a frontend in the same repository.

1. The backend handles MySQL database setup and connectivity.
2. The frontend is a Next.js application created from a Vercel v0 export.
3. Full integration between the frontend and backend is still in progress.

## Current Project Structure

```
CS625_S26_Team1/
├── backend/
│   ├── database.py
│   ├── init.sql
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── styles/
│   └── package.json
├── venv/
├── .gitignore
├── docker-compose.yml
└── README.md
```

## Database Connectivity Setup

This application uses MySQL 8.0 running in a Docker container. Follow the steps below to set up your database environment.

### Prerequisites: Install Docker

#### For macOS:
1. Download Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Open the downloaded `.dmg` file and drag Docker to Applications
3. Launch Docker Desktop and follow the setup wizard
4. Verify installation: `docker --version`

#### For Windows:
1. Download Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Run the installer and follow the setup wizard
3. Enable WSL 2 if prompted
4. Launch Docker Desktop
5. Verify installation: `docker --version`

#### For Linux (Ubuntu/Debian):
```bash
# Update package index
sudo apt update

# Install required packages
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
sudo docker --version
```

### Quick Start (TL;DR)

If you already have Docker installed, run these commands to get started:

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies and start database
pip install -r backend/requirements.txt
docker compose up -d
python backend/database.py
```

### Database Setup Instructions

#### 1. Create Virtual Environment (Required on macOS/Linux)

Python environments on modern systems require isolation to avoid conflicts:

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment (macOS/Linux)
source venv/bin/activate

# On Windows, use instead:
# venv\Scripts\activate

# Verify activation (you should see (venv) in your prompt)
which python
```

#### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Start the MySQL Database
```bash
# Start the MySQL container in detached mode
docker-compose up -d

# Check if the container is running
docker ps

# You should see output similar to:
# CONTAINER ID   IMAGE       COMMAND                  CREATED         STATUS                   PORTS                    NAMES
# abc123def456   mysql:8.0   "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes (healthy)   0.0.0.0:3306->3306/tcp   mysql_container
```

#### 4. Wait for Database Initialization
The first time you run the container, MySQL needs time to initialize:
```bash
# Check the container logs to see initialization progress
docker-compose logs -f mysql

# Wait for this message: "ready for connections"
```

#### 5. Test Database Connection
```bash
python database.py
```

Expected output:
```
Testing MySQL Database Connection...
==================================================
[SUCCESS] Connected to MySQL Server version 8.0.33
[SUCCESS] Connected to database: testdb
[SUCCESS] Basic query test: 1
[SUCCESS] Available tables: ['reports', 'users']
[SUCCESS] Reports table structure:
   - id: int
   - user_id: int
   - latitude: decimal(10,8)
   - longitude: decimal(11,8)
   - description: text
   - category: enum('safety','maintenance','environmental','infrastructure','emergency','other')
   - safety_level: enum('low','medium','high','critical')
   - status: enum('open','in_progress','resolved','closed')
   - created_at: timestamp
   - updated_at: timestamp
[SUCCESS] Total reports in database: 3
```

### Useful Docker Commands

```bash
# Start the database
docker-compose up -d

# Stop the database (keeps data)
docker-compose stop

# Stop and remove containers (data persists in named volume)
docker-compose down

# Stop and remove everything including data volume (WARNING: DESTRUCTIVE)
docker-compose down -v

# View container logs
docker-compose logs mysql

# Follow logs in real-time
docker-compose logs -f mysql

# Access MySQL command line
docker exec -it mysql_container mysql -u appuser -p testdb

# Check container status
docker-compose ps
```

### Troubleshooting Database Connectivity

**Problem: "externally-managed-environment" or pip install fails**
- **Solution**: Create and activate a virtual environment first
- **Fix**: Run `python3 -m venv venv && source venv/bin/activate` then retry pip install
- **Note**: Modern Python installations require virtual environments for package isolation

**Problem: "Connection refused" error**
- **Solution**: Make sure Docker is running and the MySQL container is started
- **Check**: Run `docker ps` to verify the container is running

**Problem: "Access denied" or authentication errors**
- **Solution**: Verify credentials in your `.env` file match the docker-compose configuration
- **Check**: Ensure `MYSQL_USER`, `MYSQL_PASSWORD` are correct

**Problem: "Unknown database" error**
- **Solution**: The database initialization may have failed
- **Fix**: Stop containers (`docker-compose down`), remove volumes (`docker-compose down -v`), and restart (`docker-compose up -d`)

**Problem: Container keeps restarting**
- **Solution**: Check logs for errors: `docker-compose logs mysql`
- **Common causes**: Port 3306 already in use, insufficient memory, corrupted data volume

**Problem: Slow initial startup**
- **Expected behavior**: First-time initialization takes 1-2 minutes
- **Solution**: Wait for "ready for connections" message in logs

## Frontend Setup Instructions

The frontend is a separate Next.js application inside the `frontend` folder.

### Frontend Prerequisites

Make sure you have the following installed:

1. Node.js
2. npm

You can verify this by using the commands below:

```
node -v
npm -v
```

#### Running the Frontend

From the root of the repository:

```
cd frontend
npm install
npm run dev
```

This should start the frontend development server, which for time being will be found using the link below:

```
http://localhost:3000
```

Your expected output is:
```
> my-project@0.1.0 dev
> next dev

▲ Next.js 16.2.3 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://10.0.0.229:3000
✓ Ready in ___ms
```

## Running Backend and Frontend Separately

At the moment, the backend and frontend should be started in separate terminals.

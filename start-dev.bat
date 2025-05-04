@echo off
REM Start development environment for TalentBridge

REM Set environment variables
set NODE_ENV=development
set JWT_SECRET=dev_secret_key_do_not_use_in_production

REM Check if Docker is running
docker info > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo Starting TalentBridge development environment...

REM Build and start containers
docker-compose up --build -d postgres

echo PostgreSQL is starting...
echo Waiting for PostgreSQL to be ready...
timeout /t 5 /nobreak > nul

REM Start backend in development mode
echo Starting backend server...
cd backend
start cmd /k "npm install && npm run dev"

REM Start frontend in development mode
echo Starting frontend server...
cd ../frontend
start cmd /k "npm install && npm start"

echo TalentBridge development environment is running!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo Press Ctrl+C in the terminal windows to stop each service
echo To shut down PostgreSQL, run 'docker-compose down' in this directory

exit /b 0 
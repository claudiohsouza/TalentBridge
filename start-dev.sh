#!/bin/bash

# Start development environment for TalentBridge

# Set environment variables
export NODE_ENV=development
export JWT_SECRET=dev_secret_key_do_not_use_in_production

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install it and try again."
    exit 1
fi

echo "Starting TalentBridge development environment..."

# Build and start containers
docker-compose up --build -d postgres

echo "PostgreSQL is starting..."
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Start backend in development mode
echo "Starting backend server..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!

# Start frontend in development mode
echo "Starting frontend server..."
cd ../frontend
npm install
npm start &
FRONTEND_PID=$!

# Handle cleanup on exit
trap 'echo "Shutting down..."; kill $BACKEND_PID $FRONTEND_PID; docker-compose down; echo "Done!"; exit 0' INT TERM

echo "TalentBridge development environment is running!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop all services"

# Wait for user to press Ctrl+C
wait 
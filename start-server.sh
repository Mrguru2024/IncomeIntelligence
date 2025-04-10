#!/bin/bash

# Set the new port
export PORT=3000

# Stop any existing Node.js processes
echo "Stopping any existing Node.js processes..."
pkill -f "node" || true

# Wait a moment to ensure processes are stopped
sleep 2

# Start the server with new port
echo "Starting server on port $PORT..."
npm run dev
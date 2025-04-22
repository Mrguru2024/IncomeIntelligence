#!/bin/bash

# Make sure any running server is terminated
pkill -f "node.*server"

# Wait a moment for processes to stop
sleep 1

# Run the clean server (completely Firebase-free)
echo "Starting clean Firebase-free version of Stackr..."
npx tsx clean-server.js
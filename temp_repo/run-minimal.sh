#!/bin/bash

# Make sure any running server is terminated
pkill -f "node.*server"

# Wait a moment for processes to stop
sleep 1

# Run the minimal server
echo "Starting minimal Firebase-free version of Stackr..."
npx tsx server/minimal.ts
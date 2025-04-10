#!/bin/bash

# Kill any running server
pkill -f "node.*server"

# Wait for processes to stop
sleep 1

# Start the GREEN version of the Stackr app
echo "🟢 Starting GREEN version of Stackr (100% Firebase-free)"
node --experimental-modules green/server.js
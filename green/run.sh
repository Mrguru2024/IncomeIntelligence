#!/bin/bash

# Run the GREEN (Firebase-free) server
echo "🟢 Starting GREEN Firebase-free version of Stackr..."
node --experimental-modules --es-module-specifier-resolution=node green/server.js
#!/bin/sh
echo "Starting SvelteKit application..."
echo "Environment variables:"
env | grep -E "(NODE_ENV|HOST|PORT)"
echo "Files in /app:"
ls -la
echo "Starting node server/index.js"
exec node server/index.js
#!/bin/sh

echo "=== Strapi Container Starting ==="
echo "NODE_ENV: $NODE_ENV"
echo "DATABASE_HOST: $DATABASE_HOST"
echo "URL: $URL"
echo "FRONTEND_URL: $FRONTEND_URL"

if [ "$NODE_ENV" = "development" ]; then
    echo "Running in development mode..."
    exec npm run develop
else
    echo "Building Strapi with current environment variables..."
    npm run build
    echo "Starting Strapi server..."
    exec npm run start
fi

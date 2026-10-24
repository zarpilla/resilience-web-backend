#!/bin/bash
# One-time setup of the test environment on the production server (run as resi, no sudo).
# Idempotent: re-running keeps existing secrets and data.
set -euo pipefail
TEST_ROOT=${TEST_ROOT:-/var/www/resilience-web/test}
PROD_BACKEND=/var/www/resilience-web/resilience-web-backend
mkdir -p "$TEST_ROOT"/{env,data/uploads,backups}
chmod 700 "$TEST_ROOT/env"
chmod 777 "$TEST_ROOT/data/uploads"   # written by the node user inside the container
cd "$TEST_ROOT"

# 1. checkouts of the develop branch (same deploy keys as production)
[ -d resilience-web-backend ] || git clone -q -b develop git@github.com-resilience-web-backend:zarpilla/resilience-web-backend.git
[ -d resilience-web-frontend ] || git clone -q -b develop git@github.com-resilience-web-frontend:zarpilla/resilience-web-frontend.git

# 2. secrets (generated once; outside the repositories)
rnd() { openssl rand -base64 32 | tr -d '\n=/+' ; }
if [ ! -f env/backend.env ]; then
  # database credentials are the production ones (same Postgres server, another database)
  grep -E '^(DATABASE_CLIENT|DATABASE_PORT|DATABASE_USERNAME|DATABASE_PASSWORD|LIBRETRANSLATE_[A-Z_]+)=' "$PROD_BACKEND/.env" > env/backend.env
  cat >> env/backend.env <<EOT
HOST=0.0.0.0
PORT=1351
NODE_ENV=production
DATABASE_HOST=strapiDB
DATABASE_NAME=resilience_web_test
APP_KEYS=$(rnd),$(rnd)
API_TOKEN_SALT=$(rnd)
ADMIN_JWT_SECRET=$(rnd)
TRANSFER_TOKEN_SALT=$(rnd)
JWT_SECRET=$(rnd)
# e-mail disabled on purpose: test forms must never mail real people
SMTP_HOST=smtp.disabled.invalid
SMTP_PORT=25
STRAPI_TELEMETRY_DISABLED=true
EOT
  chmod 600 env/backend.env
fi
if [ ! -f env/frontend.env ]; then
  cat > env/frontend.env <<EOT
API_BASE_URL=https://w.resilience.earth
NUXT_PUBLIC_API_BASE=https://w.resilience.earth
NUXT_PUBLIC_API_BASE_URL=https://w.resilience.earth
BASE_URL=https://w.resilience.earth
EOT
fi
# the front end build reads .env (copied into the image)
cp env/frontend.env resilience-web-frontend/.env

# 3. database: copy of production (only the first time)
if ! docker exec strapiDB psql -U resilience -p 5433 -lqt | cut -d'|' -f1 | grep -qw resilience_web_test; then
  "$TEST_ROOT/resilience-web-backend/tools/test-env/refresh-db.sh"
fi

# 4. start
"$TEST_ROOT/resilience-web-backend/tools/test-env/deploy.sh"

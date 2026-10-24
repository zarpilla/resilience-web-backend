#!/bin/bash
# Deploy the latest `develop` to the test environment.
set -euo pipefail
TEST_ROOT=${TEST_ROOT:-/var/www/resilience-web/test}
export TEST_ROOT
cd "$TEST_ROOT/resilience-web-backend" && git fetch -q origin && git checkout -q develop && git reset -q --hard origin/develop
cd "$TEST_ROOT/resilience-web-frontend" && git fetch -q origin && git checkout -q develop && git reset -q --hard origin/develop
cp "$TEST_ROOT/env/frontend.env" "$TEST_ROOT/resilience-web-frontend/.env"
C="$TEST_ROOT/resilience-web-backend/tools/test-env"
docker compose -f "$C/backend.compose.yml" pull -q
docker compose -f "$C/backend.compose.yml" up -d --force-recreate
docker compose -f "$C/frontend.compose.yml" up -d --build
echo "deployed: backend $(git -C "$TEST_ROOT/resilience-web-backend" log --oneline -1)"
echo "          frontend $(git -C "$TEST_ROOT/resilience-web-frontend" log --oneline -1)"
echo "Strapi rebuilds its admin at start (~2-3 min): docker logs -f re_web_back_test"

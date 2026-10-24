#!/bin/bash
# Replace the TEST database with a fresh copy of PRODUCTION. Test content is lost (a dump is kept).
set -euo pipefail
TEST_ROOT=${TEST_ROOT:-/var/www/resilience-web/test}
STAMP=$(date +%Y%m%d-%H%M)
cd "$TEST_ROOT"
if docker exec strapiDB psql -U resilience -p 5433 -lqt | cut -d'|' -f1 | grep -qw resilience_web_test; then
  docker exec strapiDB pg_dump -U resilience -p 5433 -Fc resilience_web_test > "backups/test-before-refresh-$STAMP.dump"
fi
docker exec strapiDB pg_dump -U resilience -p 5433 -Fc resilience_web2 > "backups/prod-$STAMP.dump"
docker stop re_web_back_test >/dev/null 2>&1 || true
docker exec strapiDB dropdb -U resilience -p 5433 --if-exists resilience_web_test
docker exec strapiDB createdb -U resilience -p 5433 resilience_web_test
docker exec -i strapiDB pg_restore -U resilience -p 5433 -d resilience_web_test --no-owner --no-acl < "backups/prod-$STAMP.dump" || true
docker start re_web_back_test >/dev/null 2>&1 || true
# keep the last 10 dumps
ls -1t backups/*.dump | tail -n +11 | xargs -r rm --
echo "test database refreshed from production ($STAMP)."
echo "API tokens of production do not work in test (different salt): create test tokens in the test admin."

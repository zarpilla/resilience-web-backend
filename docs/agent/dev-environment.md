# Development copy of production (for the developer / an agent with shell access)

Goal: a local Strapi + Nuxt with **production data**, to try content changes before doing
them in production, and to take screenshots.

Production server: `ssh resi@161.22.47.151`
- Backend: `/var/www/resilience-web/resilience-web-backend` (container `re_web_back`, port 1350 → api-w.resilience.earth)
- Database: container `strapiDB` (Postgres 12, port 5433, user `resilience`, **database `resilience_web2`**)
- Uploads: `/var/www/resilience-web/resilience-web-backend/public/uploads` (~6 GB)
- Frontend: `/var/www/resilience-web/resilience-web-frontend` (port 3003)

## 1. Copy the database

```bash
mkdir -p ~/rw-dev && cd ~/rw-dev
ssh resi@161.22.47.151 'docker exec strapiDB pg_dump -U resilience -p 5433 -Fc resilience_web2' > prod.dump

# into a local Postgres (any version ≥ 12); never reuse a database you care about
createdb -h localhost -U <user> resilience_web_prod
pg_restore -h localhost -U <user> -d resilience_web_prod --no-owner --no-acl prod.dump
# "unrecognized configuration parameter transaction_timeout" is harmless
```

With Docker instead: start `postgres:12` and `pg_restore` into it the same way.

## 2. Copy the uploads (images, videos)

```bash
rsync -a resi@161.22.47.151:/var/www/resilience-web/resilience-web-backend/public/uploads/ \
      resilience-web-backend/public/uploads/
```

## 3. Run Strapi against the copy

Use a **separate checkout or copy** of the backend if another `strapi develop` is already
running in the repo (both would share `dist/` and restart each other).

```bash
cd resilience-web-backend
export DATABASE_CLIENT=postgres DATABASE_HOST=127.0.0.1 DATABASE_PORT=5432 \
       DATABASE_NAME=resilience_web_prod DATABASE_USERNAME=<user> DATABASE_PASSWORD=<pwd> \
       PORT=1347 HOST=127.0.0.1
npx strapi build && npx strapi start
# local admin user (only in the copy):
npx strapi admin:create-user --firstname=Dev --lastname=Local --email=dev@local.test --password='...'
```

Create a full-access API token for the agent: admin → Settings → API Tokens (or
`POST /admin/api-tokens` with an admin JWT).

## 4. Run the front end against it

```bash
cd resilience-web-frontend
API_BASE_URL=http://localhost:1347 NUXT_PUBLIC_API_BASE_URL=http://localhost:1347 npx nuxt build
PORT=3011 API_BASE_URL=http://localhost:1347 NUXT_PUBLIC_API_BASE_URL=http://localhost:1347 \
  node .output/server/index.mjs
```

(`nuxt dev` also works, but don't run two `nuxt dev` in the same folder.)

## 5. Screenshots

Playwright works well (Chromium). Useful tricks used for the manual:
- Wait for `load` (not `networkidle`: there are looping background videos).
- Scroll the page once before a full-page screenshot (lazy images / GSAP).
- Hide the fixed header for block screenshots: `header{visibility:hidden!important}`.
- Element screenshot of a block: `.section-inner-index-<n>` (n = 0-based block index after
  templates are merged) or `.section-sections-<type>`.

## 6. Comparing dev and production

After a change in dev, take the same screenshot of the page in dev and in production and
compare (e.g. ImageMagick `compare -metric AE -fuzz 2% a.png b.png diff.png`). Expect small
differences from videos/animations only.

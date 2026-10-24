# Pla de desplegament — octubre 2026

> ✅ **Executat el 24/10/2026.** Còpia prèvia de la BD a `~/backups-rw/` (servidor). Còpies de
> cada document modificat a `_stuff/rw-backups-prod/` (màquina de desenvolupament). Token de
> contingut actiu: `content-fixes-2026-10-b` (caduca el 23/11/2026; fitxer
> `resilience-web/.secrets/prod-content-token.txt`). Token `frontend` revocat: el frontend ja no
> en fa servir cap. Per desplegar NO s'han fet servir `deploy-re-web-*.sh` (fan `git reset --hard`,
> que esborra els canvis locals de `docker-compose.yml`, i `docker system prune -a`, interactiu):
>
> ```bash
> # backend
> cd /var/www/resilience-web/resilience-web-backend && git pull --ff-only origin main && docker compose pull && docker compose up -d
> # frontend
> cd /var/www/resilience-web/resilience-web-frontend && git pull --ff-only origin main && docker compose up -d --build
> ```

Canvis de codi (sense commit encara) + correccions de contingut. L'**ordre importa**: amb la
tasca 001 la web passa a mostrar la versió *publicada*, i hi ha esborranys pendents que cal
publicar abans.

Provat sencer en una còpia local de producció (24/10/2026) amb regressió de 303 pàgines.

## 0. Preparar

- Token d'escriptura per a les correccions (Strapi → Settings → API Tokens → *Full access*,
  caducitat curta). **No** fer servir el token del frontend.
- `cd resilience-web-backend && export RW_API_URL=https://api-w.resilience.earth RW_API_TOKEN=<token>`
- Còpia de la BD: `ssh resi@161.22.47.151 'docker exec strapiDB pg_dump -U resilience -p 5433 -Fc resilience_web2' > backup-pre-2026-10.dump`

## 1. Contingut (abans de desplegar codi)

```bash
# 1a. Tasca 002: menús que falten a les plantilles ES/EN + classes CSS traduïdes
node tools/content-cli/fixes/2026-10-fix-locale-content.mjs            # revisar
node tools/content-cli/fixes/2026-10-fix-locale-content.mjs --apply

# 1b. Publicar els esborranys pendents que són la versió bona
C=tools/content-cli/rw-content.mjs
for d in pl0dlk1idfewo1dumou4rptm nhl7mg0d20t46dim7kfened6 kcw6a6c51jj9hl2svenx3s7g; do
  for l in es en; do node $C publish $d --locale $l --yes; done
done

# 1c. Tasca 007: traduccions desactualitzades (salta el que s'hagi editat des del 24/10)
node tools/content-cli/fixes/2026-10-translations/apply.mjs            # revisar SKIP/WOULD WRITE
node tools/content-cli/fixes/2026-10-translations/apply.mjs --apply

# 1d. Correccions del text català (i les seves traduccions). SEMPRE després de 1c.
node tools/content-cli/fixes/2026-10-catalan-fixes/apply.mjs
node tools/content-cli/fixes/2026-10-catalan-fixes/apply.mjs --apply

# 1e. Tasca 004: sortDate dels recursos = ordre visible avui (després de 1c i 1d)
node tools/content-cli/fixes/2026-10-resource-sortdate.mjs
node tools/content-cli/fixes/2026-10-resource-sortdate.mjs --apply
```

Bios mai publicades: decidit **deixar-les sense publicar** (deixaran de sortir).
Tornar a executar qualsevol d'aquests scripts és segur (`ALREADY APPLIED` / `ok`).

## 2. Codi

Backend (`resilience-web-backend`):
- `src/api/page/controllers/page.ts` — llegeix la versió publicada; 404 si falta l'idioma (001)
- `src/middlewares/public-published-only.ts` + `config/middlewares.ts` — sense token no es
  poden llegir esborranys (003)
- `src/admin-help/*` + `src/index.ts` — ajudes en català a l'admin
- `docs/`, `tools/`, `AGENTS.md`, `README.md`

Frontend (`resilience-web-frontend`):
- `nuxt.config.ts`, `plugins/api.ts` — el token ja no arriba al navegador (003)
- `components/` — bugs de la tasca 005 (scroller `/>`, SEO de bios, robots `noIndex`, text
  «Escolta», fallback de menú i capabilitats, modal sense espai buit, llistes numerades i
  enllaços dins de llistes) i «Carregar més» ordenat (004)
- `AGENTS.md`

Desplegar com sempre (push a `main` → CI → `deploy-re-web-*.sh`).

## 3. Després de desplegar

- Comprovar: Home ca/es/en, `/caos-creatiu`, `/eines-disruptives`, un article
  `/es/articulo/...` (slider final amb targetes), `/es/como-trabajamos` (finançadors),
  formulari de contacte i subscripció.
- `curl 'https://api-w.resilience.earth/api/pages?status=draft&locale=ca&filters[slug][$eq]=teoria-u'`
  → ha de tornar `data: []`.
- **Rotar el token del frontend** (tasca 003): nou token *Read-only* (o cap) a `.env` com a
  `API_TOKEN`, treure `NUXT_PUBLIC_API_TOKEN`, reconstruir el frontend, revocar el vell.
- Revocar el token d'escriptura del pas 0 si no s'ha de fer servir més, i els dos tokens
  `content-fixes-2026-10` creats per error el 24/10 (la seva clau es va perdre: inservibles,
  però s'han d'esborrar). Admin → Settings → API Tokens.

## Desfer

- Contingut: cada escriptura deixa còpia a `rw-backups/`; `node tools/content-cli/rw-content.mjs restore <fitxer> --yes`.
- Tot: restaurar `backup-pre-2026-10.dump`.
- Codi: revertir el commit.

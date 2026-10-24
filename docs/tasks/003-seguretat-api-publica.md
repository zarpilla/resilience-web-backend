# 003 — Esborranys llegibles per l'API pública i token al navegador

- **Estat:** ✅ feta i desplegada el 24/10/2026.
- **Prioritat:** mitjana
- **Data:** 2026-10-24 · **Tipus:** seguretat

## 1. L'API pública retorna esborranys

`GET https://api-w.resilience.earth/api/pages?status=draft&...` sense autenticació retorna
pàgines mai publicades (comprovat amb `teoria-u`, `publishedAt: null`). Qualsevol persona
pot llegir esborranys.

**Proposta:** middleware global (o `config/middlewares.ts` + `src/middlewares/`) que, per a
peticions sense token d'API vàlid a `/api/*`, elimini o forci `status=published`. Compte: el
mateix frontend no demana `status=draft` (AppPage usa `published`), però l'endpoint custom
`/api/pages/sections/:id` llegeix draft internament (tasca 001).

## 2. Token d'API exposat al navegador

`nuxt.config.ts` posa `apiToken` a `runtimeConfig.public`, i `plugins/api.ts` l'envia com a
`Authorization: Bearer` des del client. Per tant el token arriba a qualsevol navegador.

**Proposta:** verificar a Strapi (Settings → API Tokens) que aquest token és **read-only**
(o *Custom* només amb `find/findOne` de pages, menus, header, footer, text, templates…, i
`create` de lead/subscription si cal). Idealment moure les crides amb token al servidor
(Nuxt server routes) o no fer servir token al client (el rol Public ja pot llegir).

Els tokens d'escriptura per a agents d'IA han de ser **diferents**, amb caducitat, i
revocables.

## Criteris d'acceptació

- [ ] `status=draft` sense token no retorna esborranys.
- [ ] El token públic no pot escriure (`PUT /api/pages/...` → 401/403).
- [ ] La web funciona igual.

## Implementació (24/10/2026)

- Backend: `src/middlewares/public-published-only.ts` (registrat a `config/middlewares.ts`):
  sense capçalera `Authorization`, `status` es força a `published`.
- Frontend: `apiToken` passa a `runtimeConfig` privat i `plugins/api.ts` només l'envia des del
  servidor (SSR). Les crides des del navegador van sense token (el rol Public ja té permisos
  per a tot el que fa servir la web, inclosos els formularis — comprovat en local).
- ⚠️ **El token actual del frontend és *full-access* i ha estat exposat al navegador.** Després de
  desplegar: crear un token nou *Read-only* (o cap), posar-lo a `.env` del frontend com a
  `API_TOKEN`/`NUXT_API_TOKEN`, treure `NUXT_PUBLIC_API_TOKEN`, reconstruir, i **revocar l'antic**.

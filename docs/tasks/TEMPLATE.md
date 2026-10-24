# NNN — Títol curt de la tasca

- **Estat:** proposada | en curs | feta
- **Prioritat:** alta | mitjana | baixa
- **Demanat per:** (persona) · **Data:** AAAA-MM-DD
- **Tipus:** nou bloc | canvi de bloc existent | bug | contingut | infraestructura

## Què es vol (paraules de qui ho demana)

> Text original de la petició.

## On

- Pàgina(es): https://resilience.earth/...
- Idiomes: ca / es / en
- Referències visuals: (captures, enllaços, Figma)

## Què hi ha ara

- Blocs actuals més propers i per què no serveixen.
- Captura de l'estat actual (si n'hi ha).

## Proposta tècnica

- **Backend (Strapi):** components/camps a crear o modificar (`src/components/sections/*.json`,
  `src/components/meta/*.json`), afegir-lo a la dynamic zone de `api::page.page` i
  `api::template.template`, populate a `src/api/page/controllers/page.ts`, ajudes a
  `src/admin-help/field-help.ts`.
- **Frontend (Nuxt):** component `components/Sections<Nom>.vue`, registre a
  `components/AppPage.vue`, estils.
- **Contingut:** què s'haurà d'omplir després i on.

## Criteris d'acceptació

- [ ] ...
- [ ] Es veu bé a mòbil, tauleta i ordinador.
- [ ] Les pàgines existents es veuen exactament igual (captures abans/després).
- [ ] Documentat al manual (`docs/manual/04-blocs.md`) i a `docs/agent/AGENT.md`.

## Notes / feina ja preparada

- (p. ex. pàgina esborrany creada a l'admin: enllaç)

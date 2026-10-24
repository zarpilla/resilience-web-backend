# 004 — Ordre de la llista d'Eines disruptives

- **Estat:** feta (pendent de desplegar) — `SectionsBlog.vue` ordena per `sortDate` (+ `createdAt`), també a «Carregar més». Com que tots els recursos tenien el mateix `sortDate`, `tools/content-cli/fixes/2026-10-resource-sortdate.mjs` els en dona un de diferent que conserva l'ordre visible el 24/10/2026.
- **Prioritat:** baixa
- **Data:** 2026-10-24 · **Tipus:** canvi de bloc existent

## Troballa important (24/10/2026)

A producció la llista automàtica **mai es carregava**: un error de JavaScript (`useI18n()` als
getters de Pinia) i `useFetch` cridat des d'`onMounted` feien que es mostrés sempre la llista
manual `blogPage` del bloc. Corregit al frontend. Per no canviar l'ordre que veien les visites,
l'script de `sortDate` reprodueix l'ordre d'aquella llista manual. En castellà i anglès,
a més, apareixeran els recursos que faltaven a la llista manual (p. ex. *Marcos sistémicos*).

## Què passava

`components/SectionsBlog.vue` (mode `filter = true`):

- ordena els recursos per **`updatedAt:desc`** → editar un recurs antic el puja a dalt de tot;
- el «Carregar més» (`loadMore`) demana la pàgina següent **sense `sort`** → l'ordre de la
  segona tanda és arbitrari;
- la llista manual `blogPage` es descarta quan `filter = true`.

Caos Creatiu (Masonry), en canvi, ordena per `sortDate:desc`, que els editors controlen.

## Proposta

Ordenar per `sortDate:desc` (i `updatedAt:desc` com a desempat) a `queryResources` i a
`loadMore`. El camp `sortDate` ja existeix a totes les pàgines i es posa sol en crear-les.

⚠️ **Canvia l'ordre visible actual.** Abans de desplegar, revisar el `sortDate` dels 10
recursos (`rw-content list --type resource`) perquè l'ordre resultant sigui el desitjat.

## Criteris d'acceptació

- [ ] L'ordre no canvia en editar un recurs.
- [ ] «Carregar més» manté l'ordre.
- [ ] Actualitzar manual (`03-receptes.md` §B, `04-blocs.md` Blog) i `AGENT.md`.

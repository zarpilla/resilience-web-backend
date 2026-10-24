# 004 — Ordre de la llista d'Eines disruptives

- **Estat:** parcialment feta — «Carregar més» ja manté l'ordre (`SectionsBlog.vue`). Pendent de decidir: ordenar per `sortDate`.
- **Prioritat:** baixa
- **Data:** 2026-10-24 · **Tipus:** canvi de bloc existent

## Què passa

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

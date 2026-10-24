# 005 — Petits bugs i camps sense efecte (frontend)

- **Estat:** majoritàriament feta (desplegada el 24/10/2026). Fetes: 1, 2, 3, 5, 6, 12, 13, 14 (llistes numerades i enllaços dins de llistes). Pendents: 4, 7, 8, 9, 10, 11 (canvien l'aspecte o l'esquema: cal decidir).
- **Prioritat:** baixa
- **Data:** 2026-10-24 · **Tipus:** bug

Detectats revisant el codi per al manual. Cap d'ells es veu a les pàgines actuals (o es veu
poc), però confonen qui edita. Les ajudes de l'admin (`src/admin-help/field-help.ts`) ja
marquen els camps sense efecte.

| # | On | Problema | Proposta |
|---|---|---|---|
| 1 | `SectionsScroller.vue:149` (preset images) | Es pinta un `/>` literal sota cada imatge. | Treure el text sobrant. |
| 2 | `AppBio.vue` | `metadata` de Bio és repetible però es llegeix com a objecte → les bios no tenen títol/descripció/imatge SEO. | Llegir `metadata[0]` o fer el component no repetible (migració). |
| 3 | `MetaListen.vue` | Si `Text.listen` és buit mostra «Sending...». | Fallback «Escolta». |
| 4 | `SectionsMenu.vue` preset `title-sections` | No té plantilla: no pinta res. | Treure l'opció de l'enum o implementar-la. |
| 5 | `SectionsMenu.vue` preset `default` | Usa només `title`; si és buit, l'enllaç és invisible (la resta de menús fan `page.name \|\| title`). | Fallback a `page.name`. ⚠️ comprovar que cap menú *default* tingui títols buits volguts. |
| 6 | `SectionsModal` dins `AppSection` | El modal deixa un espai buit de 120 px on es col·loca. | No embolcallar-lo amb `AppSection` o afegir-li `py-0`. |
| 7 | `SectionsBlurbs.vue` | `imagePosition`, `imageWidth`, `cssClass`, `svg`, `effect` ignorats; text pla. | Implementar o treure del schema. |
| 8 | `SectionsSlider.vue` preset `three-black` | Sense comportament propi (l'aspecte fosc ve de la classe). | Treure de l'enum o fer-lo equivalent a `three` + classe. |
| 9 | `AppSection.vue` | `styles.width` es calcula però no s'aplica (excepte Tabs). | Aplicar-lo o treure'l. |
| 10 | `SectionsHero.vue` | `align: post` sense CSS. Hero als àmbits mostra l'etiqueta de `Text.services` en lloc de `Text.scopes`. | Revisar. |
| 11 | `SectionsBios.vue`, `SectionsCapabilities.vue` | L'estat de les fletxes dels desplegables fa servir l'índex global de `.collapse` de tota la pàgina. | Fer servir refs locals. |
| 12 | `SectionsCapabilities.vue` | Si `c2aText` és buit, l'enllaç no té text (el fallback «More» no s'arriba a usar). | Corregir el `v-if`. |
| 13 | `metadata.noIndex` | No genera `<meta name="robots">`. | Afegir a `useSeoMeta`. |
| 14 | `MetaText.vue` | Llistes numerades surten com a punts; enllaços dins de llistes/títols perden el text; cursiva a llistes (`text.italic`). | Corregir el render dels blocks. |

## Criteris d'acceptació

- [ ] Captures abans/després de les pàgines existents idèntiques (excepte el que es corregeix).
- [ ] Actualitzar `field-help.ts` i el manual on calgui.

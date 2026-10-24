# 006 — Millores de l'admin per a editors no tècnics

- **Estat:** proposada
- **Prioritat:** mitjana
- **Data:** 2026-10-24 · **Tipus:** millora

Fet ja (octubre 2026): textos d'ajuda en català sota cada camp
(`src/admin-help/field-help.ts`, aplicats a l'arrencada; es poden desactivar amb
`ADMIN_FIELD_HELP=false`).

També fet: l'eina `rw-content menu-add` posa automàticament el nom de la pàgina com a `title` de l'element (per tenir files amb nom a l'admin).

Idees pendents, de més a menys impacte:

1. **Elements de menú sense nom a l'admin.** Als menús dels sliders els elements només tenen
   `page`, i Strapi els mostra com a files en blanc (el *main field* d'un component només pot
   ser un camp de text). Opcions:
   - lifecycle a `api::menu.menu` (`beforeCreate`/`beforeUpdate`) que ompli `children[].title`
     amb el `name` de la pàgina quan `title` és buit. Visualment segur als sliders,
     tags-cloud, marquee i menús de capçalera/peu (usen `page.name` primer); al preset
     *default* faria visibles enllaços que avui són invisibles (vegeu tasca 005 #5);
   - o script puntual que ompli els títols buits (`rw-content`).
2. **Desplegable de classes d'amplada de columna.** Afegir a `meta.styles` un camp enum
   opcional `columnWidth` (`1/4`, `1/3`, `1/2`, `2/3`, `3/4`, `full`) i `columnOffset`, i que
   el frontend els tradueixi a `col-12 col-md-N offset-md-M`. Mantenir `cssClass` per
   compatibilitat (les pàgines existents no canvien).
3. **Desplegable de colors** (`backgroundColor`): enum amb els colors de marca + «altre».
4. **Previsualització**: configurar el *Preview* de Strapi 5 (`config/admin.ts` → `preview`)
   cap a la URL pública de cada pàgina (requereix tasca 001 per tenir un mode esborrany real).
5. **Rol d'editor**: crear un rol d'admin «Editor» sense accés a Content-Type Builder,
   Settings, Users, ni als camps tècnics de Header (`css`).
6. **Admin en català**: `src/admin/app.tsx` amb `config.locales: ['ca']` (Strapi té
   traducció parcial al català) per a qui ho prefereixi.

# 001 — La web mostra l'esborrany (draft) de les pàgines publicades

- **Estat:** ✅ feta i desplegada el 24/10/2026 — `src/api/page/controllers/page.ts`.
- **Prioritat:** mitjana (decisió de comportament)
- **Data:** 2026-10-24 · **Tipus:** bug / comportament

## Què passa

El controlador personalitzat `src/api/page/controllers/page.ts` (`sections` i `templates`)
fa `strapi.documents(...).findOne/findFirst` **sense `status`**. A Strapi 5 el valor per
defecte és `draft`, de manera que:

- la web troba la pàgina per la versió publicada (`AppPage.vue` filtra `status: published`),
- però **pinta els blocs i les metadades de l'esborrany**.

Conseqüència: fer *Save* (sense *Publish*) en una pàgina publicada ja canvia la web. Ho he
comprovat en local canviant només l'esborrany: l'endpoint `/api/pages/sections/:id`
retorna l'esborrany. També afecta `categories` (comptadors de filtres inclouen esborranys).

El manual ho documenta tal com funciona avui.

## Proposta

Afegir `status: "published"` a les crides de `findOne` (sections, templates internes) i
`findMany` (categories). Les plantilles no tenen draft&publish, no els afecta.

```ts
const page = await strapi.documents("api::page.page").findOne({
  documentId: ctx.params.id,
  locale: ctx.query.locale as string,
  status: "published",
  populate: { ... },
});
```

## Abans de desplegar

Pàgines que **avui tenen esborrany diferent de la versió publicada** (a 24/10/2026), i que
per tant canviarien de contingut visible en aplicar el canvi:

| Pàgina | Idiomes | Esborrany desat |
|---|---|---|
| resource `futurs-impossibles` | ca, es, en | 2025-07-06 |
| resource `els-patrons-internacionals-de-la-resiliencia-territorial` | ca, es, en | 2025-07-06 |

Per a cadascuna: comparar draft i published (`rw-content show <slug> --status draft` vs
`--status published`) i **publicar** la versió bona abans de desplegar.

Consulta per tornar-ho a comprovar:

```sql
select d.locale, d.type, d.slug, d.updated_at, p.updated_at
from pages d join pages p on p.document_id=d.document_id and p.locale=d.locale and p.published_at is not null
where d.published_at is null and d.updated_at > p.updated_at + interval '2 seconds';
```

## Criteris d'acceptació

- [ ] *Save* sense *Publish* no canvia la web; *Publish* sí.
- [ ] Les pàgines existents es veuen igual (captures abans/després de Home, Caos Creatiu, Eines, un article, un recurs).
- [ ] Actualitzar `docs/manual/01-conceptes.md` §5, `docs/agent/AGENT.md` §3.2 i `tools/content-cli` (avisos).

## Implementació (24/10/2026)

- `sections`, `templates` i `categories` llegeixen `status: "published"`. Amb un token d'API
  es pot demanar `?status=draft` (previsualització, eines).
- Si una pàgina no existeix en un idioma, l'endpoint retorna 404 (abans petava amb un 500).
- Regressió en local (303 pàgines, HTML normalitzat + captures): l'únic canvi visible, a banda
  dels esborranys pendents ja coneguts, és que **deixen de sortir les Bios mai publicades**:

  | Bio | Idiomes sense publicar | On sortia |
  |---|---|---|
  | Àlex Espuña | ca, es, en | àmbits Cultura, Joventut |
  | Cristina Castellana | ca | àmbits Drets humans i pau, Joventut |
  | Dani Vidal | ca | àmbits Economia, Energia, Mobilitat, Polítiques públiques |
  | Jordi Sabaté | es, en | Quiénes somos / Who we are |
  | Silvia Martínez de la Casa, Israa Rila | ca | (no surten a cap llista) |

  Avui aquestes persones surten però el seu enllaç `/bio/...` dona error. **Decidir:** publicar-les
  (es mantenen a les pàgines) o deixar-les sense publicar (desapareixen).

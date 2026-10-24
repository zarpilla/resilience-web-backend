# 002 — Sliders buits i classes CSS traduïdes en castellà i anglès

- **Estat:** ✅ aplicada a producció el 24/10/2026 (14 canvis)
- **Prioritat:** alta — és visible a producció
- **Data:** 2026-10-24 · **Tipus:** contingut

## Què passa (producció, 24/10/2026)

1. **Plantilles sense menú en ES/EN.** Els blocs Slider d'algunes plantilles no tenen el menú
   enllaçat a la versió castellana/anglesa. Resultat: una **franja negra buida** al final de
   les pàgines afectades.

   | Plantilla | Idioma | Bloc | Menú que hi falta |
   |---|---|---|---|
   | `article` (final de **tots els articles**) | es, en | Slider «Caos Creatiu» | Caos Creativo / Caos Creative |
   | `resource` (final de **tots els recursos**) | es, en | Slider «Eines disruptives» | Recursos para catalizar… / Resources to catalyze… |
   | `scope` (pàgines d'àmbit) | es | 5è bloc (slider de recursos) | Recursos para catalizar… |
   | `scope` | en | 3r (Serveis) i 5è (recursos) | Services / Resources to catalyze… |

2. **Classes CSS traduïdes automàticament** (per la traducció automàtica de l'admin):

   | On | Idioma | Valor actual | Hauria de ser |
   |---|---|---|---|
   | plantilla `article` | es | `slider-tres-negro naranja-títulos slider-tres-negro-kaos` | `slider-three-black orange-titles slider-three-black-kaos` |
   | plantilles `article-information`, `resource-information` | es | `artículo-details` | `article-details` |
   | pàgina `home`, bloc 10 | es / en | `ancho-table-leaf` / `width-table-leaf` | `width-container-full` |
   | recursos `futurs-impossibles`, `els-patrons-internacionals…`, bloc 4 | es | `medios de comunicación-fronterizo` | `media-border-radius` |

## Solució

Script idempotent: `tools/content-cli/fixes/2026-10-fix-locale-content.mjs`

- Enllaça a cada slider/menu de plantilla ES/EN el mateix menú que la versió catalana
  (els menús comparteixen `documentId` entre idiomes; cada idioma resol la seva versió).
- Restaura les classes traduïdes.
- Les pàgines s'escriuen només com a **esborrany** (és la versió que pinta la web; vegeu
  tasca 001), per no publicar altres canvis pendents.
- Fa còpia de seguretat de cada document abans d'escriure.

```bash
cd resilience-web-backend
export RW_API_URL=https://api-w.resilience.earth RW_API_TOKEN=<token full access>
node tools/content-cli/fixes/2026-10-fix-locale-content.mjs          # dry run: llista canvis
node tools/content-cli/fixes/2026-10-fix-locale-content.mjs --apply  # aplica
```

Provat sobre una còpia local de la BD de producció: 13 canvis, segona execució «nothing to
fix», i el slider de `/es/articulo/...` torna a mostrar les targetes.

Alternativa manual (admin): Template → `article` → idioma ESP → bloc Slider → camp `menu` →
triar «Caos Creativo» → Save (i igual per a la resta de files de la taula).

## Prevenció

- Manual: `03-receptes.md` §G avisa de no traduir camps tècnics.
- Revisar la configuració del plugin `strapi-plugin-translate`: `meta.styles.cssClass` ja té
  `translate: copy`, però els valors es van traduir igualment (potser via «Translate from
  another locale» abans d'afegir l'opció, o el plugin no respecta `copy` dins de dynamic
  zones). Valorar marcar com a `copy` tots els camps tècnics (container, sectionId, colors,
  c2a.cssClass, relacions `menu`) o desactivar la traducció automàtica de components.

## Criteris d'acceptació

- [ ] `/es/articulo/<qualsevol>` i `/en/article/<qualsevol>` mostren el slider amb targetes i estil fosc.
- [ ] `/es/recurso/<qualsevol>`, `/en/resource/<qualsevol>` igual.
- [ ] Pàgines d'àmbit ES/EN mostren els sliders de Serveis i recursos.
- [ ] El script en dry run respon «nothing to fix».

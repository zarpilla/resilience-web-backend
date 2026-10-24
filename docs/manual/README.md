# Manual d'edició de resilience.earth

Aquest manual és per a les persones que editen els continguts de **https://resilience.earth** sense ser tècniques.
No cal saber programar. Només cal tenir un usuari a l'administrador de continguts (Strapi).

> **Adreça de l'administrador:** https://api-w.resilience.earth/admin
> Si no tens usuari, demana'l a la persona responsable tècnica.

---

## Què vols fer? (accés ràpid)

| Vull... | Ves a |
|---|---|
| Publicar un **nou article a Caos Creatiu** | [Receptes › Nou article](03-receptes.md#a-publicar-un-nou-article-a-caos-creatiu) |
| Publicar un **nou recurs a Eines disruptives** | [Receptes › Nou recurs](03-receptes.md#b-publicar-un-nou-recurs-a-eines-disruptives) |
| **Afegir, treure o reordenar targetes d'un slider** (Home, articles, recursos...) | [Receptes › Sliders](03-receptes.md#c-afegir-treure-o-reordenar-targetes-dun-slider) |
| Afegir una entrada a un **menú** | [Receptes › Menús](03-receptes.md#d-afegir-una-entrada-a-un-menú) |
| **Posar o treure persones** de l'equip (Qui som) | [Receptes › Persones](03-receptes.md#j-posar-i-treure-persones-de-lequip-qui-som) |
| Canviar un text o una imatge d'una pàgina | [Strapi bàsic › Editar](02-strapi-basic.md#5-editar-una-pàgina) |
| Entendre què és cada **bloc** (Hero, Columns, Slider...) | [Blocs](04-blocs.md) |
| Entendre **columnes, marges, espais, colors i classes CSS** | [Estils i maquetació](05-estils.md) |
| Saber què són les **plantilles** | [Plantilles](06-plantilles.md) |
| Traduir una pàgina | [Receptes › Traduccions](03-receptes.md#g-traduir-una-pàgina) |
| Alguna cosa no surt com esperava | [Problemes freqüents](07-problemes.md) |

## Índex

1. [Com està muntada la web](01-conceptes.md) — les peces, pàgines, blocs, tipus de pàgina, esborrany i publicat, idiomes.
2. [Strapi bàsic](02-strapi-basic.md) — entrar, trobar continguts, editar, desar, publicar, duplicar, imatges.
3. [Receptes pas a pas](03-receptes.md) — les tasques més habituals.
4. [Els blocs, un per un](04-blocs.md) — què fa cada tipus de bloc i cada camp.
5. [Estils i maquetació](05-estils.md) — graella de 12 columnes, amplades, espais, colors, classes CSS, botons i text.
6. [Plantilles](06-plantilles.md) — blocs compartits entre moltes pàgines.
7. [Problemes freqüents i limitacions](07-problemes.md).

## Tres consells abans de començar

1. **Copia abans de crear.** Gairebé sempre és més fàcil *duplicar* una pàgina que ja s'assembla al que vols i canviar-ne els textos i les imatges, que no pas començar de zero.
2. **Llegeix el text gris sota cada camp.** A l'administrador cada camp té una petita explicació en català del que fa.
3. **Save i Publish.** En una pàgina, *Save* desa un esborrany que encara no es veu a la web; el canvi es publica amb *Publish*. En canvi, els menús i les plantilles no tenen esborrany: *Save* ja és immediat. Ho expliquem a [Conceptes › Esborrany i publicat](01-conceptes.md#5-esborrany-draft-i-publicat-published).

> Les captures d'aquest manual s'han fet sobre una còpia local de la web real (octubre 2026). Alguns textos poden haver canviat, però el funcionament és el mateix.

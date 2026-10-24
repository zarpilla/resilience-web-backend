# 7. Problemes freqüents i limitacions

[← Índex](README.md)

## Problemes freqüents

**He creat un article i no surt a Caos Creatiu.**
- Està **publicat**? (Status *Published* a la llista.) Només surten els publicats.
- El `type` és `article`?
- Té `metadata → shareImage`? Sense imatge, la casella del mosaic queda buida.
- Mira el `sortDate`: si l'has duplicat d'un article antic i no l'has canviat, surt a la posició de l'antic (baixa al mosaic o prem *Carregar més*).
- Estàs mirant el mateix idioma en què l'has creat?

**He canviat una pàgina i no veig el canvi.**
- Recarrega la pàgina del navegador (Ctrl+F5 / Cmd+Shift+R).
- Si el canvi és en un títol de targeta o en la imatge d'un mosaic, comprova que hagis premut **Publish**.
- Estàs al mateix idioma?

**He canviat un menú o una plantilla «per provar» i ja surt a la web.**
Menús i plantilles no tenen esborrany: *Save* és immediat. Per a proves, fes una còpia de la pàgina o demana un entorn de proves.

**He fet canvis en una pàgina i no surten.**
Probablement has fet *Save* però no *Publish* (a la llista surt *Modified*). Prem **Publish**.

**Una targeta d'un slider surt buida o trencada.**
La pàgina enllaçada pot estar despublicada, esborrada o sense `shareImage`. Obre el menú del slider i revisa l'element (o treu-lo).

**El títol d'un bloc no surt.**
Falta triar `titleHeading` (h1, h2...).

**A mòbil les columnes queden estranyes.**
Comprova que totes les columnes tinguin `col-12` a més de `col-md-...`.

**Un bloc té massa espai a dalt o a baix.**
Posa `paddingTop` / `paddingBottom` a FALSE, o les classes `pt-0` / `pb-0` (vegeu [Espais](05-estils.md#3-espais-padding-i-margin)).

**El text no es veu (blanc sobre blanc o negre sobre negre).**
Revisa `textColor`: `light` per a fons foscos, `dark` per a fons clars.

**En castellà/anglès una part es veu diferent que en català.**
Probablement la traducció automàtica ha traduït una classe CSS (p. ex. `slider-three-black` → `slider-tres-negro`). Copia el valor exacte de `cssClass` de la versió catalana.

**El logo o el menú de dalt no es veuen.**
El color del menú depèn del `textColor` del bloc que hi ha a sota i del camp `headerColorMode` de la pàgina. Amb fons fosc: `light`.

**He esborrat una imatge de la Media Library i ara falta a la web.**
Les imatges s'usen per referència: esborrar-la la treu de totes les pàgines. Torna-la a pujar i torna-la a seleccionar on calgui.

## Limitacions conegudes (cal la persona tècnica)

Coses que **no es poden fer des de Strapi** sense canviar codi:

- Crear un **tipus de bloc nou** o canviar el disseny d'un bloc existent (tipus de lletra, animacions, mida de les targetes...).
- Ordenar el mosaic de **Caos Creatiu** o la llista d'**Eines disruptives** amb un criteri diferent de `sortDate`.
- Duplicar un sol bloc (només es pot duplicar la pàgina sencera).
- Canviar l'animació de la Home de manera diferent als textos `home2`…`home9`.
- Obrir en una pestanya nova els enllaços dels menús.
- Alguns camps existeixen però no fan res (a l'admin hi posa «Sense efecte»).

Quan necessitis alguna d'aquestes coses, explica-ho a la persona tècnica amb: la pàgina (adreça), què vols aconseguir i, si pots, una captura o un exemple d'una altra web.

[← Plantilles](06-plantilles.md) · [Índex](README.md)

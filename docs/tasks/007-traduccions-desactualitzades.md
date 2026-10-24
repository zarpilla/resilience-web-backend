# 007 — Pàgines en castellà i anglès desactualitzades respecte al català

- **Estat:** correccions preparades i provades en local; **pendent d'aplicar a producció**
- **Prioritat:** alta
- **Data:** 2026-10-24 · **Tipus:** contingut

## Com s'ha detectat

Les dates de Strapi no serveixen (es toquen tots els idiomes alhora), així que s'ha comparat
el **contingut** de les 85 pàgines publicades, bloc a bloc i en els tres idiomes, i s'ha jutjat
si l'ES/EN és una traducció del català actual. L'informe complet és a la carpeta de treball de
la sessió (`sbs-review/batch-*.md`); aquí en queda el resum.

## Correccions preparades — 30 pàgines, 59 versions

Script: `tools/content-cli/fixes/2026-10-translations/apply.mjs` (payloads + instantànies).
Cada versió ES/EN es reconstrueix sobre l'**estructura actual del català** (blocs, estils,
imatges), reaprofitant les traduccions existents que eren bones i traduint només el que faltava.
Les imatges localitzades (vídeos/imatges ES/EN propis) es mantenen.

| Pàgina | Què hi havia |
|---|---|
| **Traduccions noves** | |
| article *De la dependència a les sobiranies locals…* | no existia en es/en |
| article *Ciutadania o barbàrie…* | no existia en es; en li faltaven dues frases |
| recurs *De xarxes a ecosistemes cooperatius* | no existia en es/en |
| **Contingut desactualitzat** | |
| Com treballem | faltava tota la secció de finançadors i la imatge del Balanç social |
| Contacte | adreça antiga, faltava el mapa; meta en anglès (es) |
| Maps | l'iframe del mapa era buit (pàgina en blanc) |
| Home | subtítol del mosaic, paràgraf d'introducció antic (es) |
| L'altre món rural | llista d'autories tallada |
| Community Catalysts Toolkit (es) | paràgraf en anglès, marca mig traduïda |
| Governança local (Melina Ángel) | faltava el bloc de vídeo/cita |
| La cooperació com a clau… | frase en anglès (es), cita moguda |
| Novacè | en: text antic copiat d'un altre article; es: faltaven frases |
| Teixint futur col·lectiu | text de capçalera antic |
| Resignificar la terra (Mbembe) | «Instituto» i títol en anglès (es) |
| Xarxes, ecosistemes i pols cooperatius | faltava la frase final de crèdit |
| Construint ponts… | faltava el vídeo (bloc buit) |
| El Collsacabra obre camins… | capçalera antiga, preguntes duplicades (es), títol perdut (en) |
| Entrevista a La Directa | faltava el botó a l'entrevista; nom del diari mal traduït |
| Economia regenerativa (Sidney Cano) | capçalera incompleta, meta antiga |
| Per què la reciprocitat… | «des del» sense traduir (es) |
| Quan la ciutat recorda… | faltava «Olot» a la signatura |
| Capabilitats: facilitació cocreativa, facilitació sistèmica, governança dinàmica, biomimètica social | testimonis que faltaven (en), meta antiga, termes en català |
| Àmbits: drets humans i pau, energia, comunicació, polítiques públiques, resiliència comunitària, governança, agroalimentació | títols en anglès (es), «pedagogical» per «comunicatives» (en), metes antigues |
| Servei Disseny | paraules en català a ES/EN |
| Plantilla *template-complexitat* | botó «Connectem» sense traduir (es/en) |

Provat en local: 59/59 aplicades, cap pàgina en català canvia, cap error a les 308 pàgines, i
les pàgines ES/EN es veuen com el català (captures revisades).

## Aplicar a producció

Vegeu l'ordre complet a [DESPLEGAMENT-2026-10.md](DESPLEGAMENT-2026-10.md). L'script:
- compara el contingut actual amb les instantànies i **salta** qualsevol pàgina que s'hagi
  editat des del 24/10/2026 (cal tornar-la a revisar);
- diu `ALREADY APPLIED` si ja està feta (es pot tornar a executar);
- fa còpia de seguretat abans de cada escriptura i publica la versió ES/EN.

## No fet: cal decisió sobre el català

Hi ha casos on el problema és (probablement) **el text català**, no la traducció:

| Pàgina | Dubte |
|---|---|
| *Terra d'aus, or i memòries* (Aguaclara) | ES/EN tenen els apartats «2.1 Los Malagana» i «2.2 De la abundancia al abismo» que el català no té, però el català encara hi fa referència més avall. Potser es van esborrar del català per error. |
| *Gestió forestal… Aplec Iltir* | El català té enganxats paràgrafs sobre Achille Mbembe que semblen d'un altre article. |
| *Reflexions… Consell dels Infants d'Olot* | El català conté frases de l'article d'Òscar Gussinyer (restes de duplicar-lo). Traduccions ES/EN preparades a `out/hold/` (fora del repo), pendents de saber si cal netejar el català. |
| *El que vam salvar… McDonald's d'Olot* i *Ciutadania o barbàrie* | Les dues tenen la mateixa frase «El Fluvià és molt més que una línia d'aigua…», que no lliga amb el tema. (A *Ciutadania* s'ha traduït tal com és al català.) |
| *De la dictadura a aprendre a decidir juntes* | El català usa una imatge nova («Espiral … CAT»); no hi ha versió ES/EN de la imatge. |
| *El Collsacabra…* | Les preguntes 11–15 es repeteixen com a 16–20 amb respostes diferents (també al català). |
| Diverses | Cometes `<cite>` mal tancades al català (`<cite>` en lloc de `</cite>`) a la cooperació, facilitació cocreativa i sistèmica. |

## Altres decisions preses (revisables)

- **Imatges:** quan ES/EN feien servir una imatge diferent del català sense que semblés
  localitzada, s'ha posat la del català (p. ex. capçalera de *Com treballem*, *Construint ponts*,
  *Entrevista*, *Agroalimentació* en). Si alguna era volguda, es pot tornar a posar a l'admin.
- **Disseny (servei):** ES/EN tenien capçalera fosca (`dark`), el català clara (`light`): s'ha
  seguit el català.
- **Etiquetes, àmbits i persones (Bios)** segueixen el català; les persones sense versió en
  aquell idioma s'ometen.
- Slugs existents ES/EN es mantenen (no es trenquen enllaços), encara que alguns continguin
  paraules en català (p. ex. `…-des-del-parlamento…`).
- Errors menors de traducció només s'han corregit a les pàgines que ja es tocaven; altres
  pàgines amb traduccions automàtiques millorables (llista als informes) queden pendents.

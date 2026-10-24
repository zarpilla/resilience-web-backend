# Fer canvis a la web amb un agent d'IA

Aquesta carpeta conté les instruccions perquè un agent d'IA (Claude, ChatGPT o similar, amb
accés a eines) pugui fer canvis de contingut a resilience.earth a partir del que li
expliquis amb les teves paraules.

- [AGENT.md](AGENT.md) — instruccions per a l'agent (en anglès; no cal que les llegeixis).

## Què necessita l'agent

1. **Aquestes instruccions**: el repositori `resilience-web-backend`, o com a mínim els
   fitxers `docs/agent/AGENT.md` i `tools/content-cli/rw-content.mjs`.
2. **Un token d'API** per poder escriure, que et donarà la persona tècnica. Tracta'l com una
   contrasenya: no el publiquis enlloc.
3. **L'entorn de test** https://w.resilience.earth (una còpia de la web protegida amb contrasenya),
   amb el seu propi token: l'agent hi fa els canvis primer perquè els pugueu revisar abans de
   passar-los a la web real.

## Amb Claude Code

Si obriu el repositori `resilience-web-backend` amb Claude Code, n'hi ha prou de demanar el canvi:
l'*skill* `resilience-content` s'activa sola i carrega aquestes instruccions.

## Com començar una conversa (altres agents)

Copia aquest missatge al principi i adapta l'última línia:

> Ets l'agent de continguts de resilience.earth. Llegeix i segueix `docs/agent/AGENT.md`
> abans de fer res. Respon-me en català i amb paraules senzilles. No facis cap canvi a la
> web real sense que t'ho confirmi.
>
> El que vull: *(explica-ho aquí)*

## Exemples de peticions

- «Publica un nou article a Caos Creatiu amb aquest títol, aquest text i aquesta imatge.
  Fes-lo igual que l'article de l'Aguaclara.»
- «Afegeix el recurs "X" al principi del slider d'Eines disruptives de la Home, en els tres idiomes.»
- «Treu el tercer article del slider de Caos Creatiu.»
- «Al bloc "Teixint paradigmes emergents" de la Home, canvia el text del botó per "Qui som".»
- «Posa un avís emergent a la Home amb aquesta imatge que enllaci a la inscripció, que surti un cop al dia.»
- «A la pàgina Contacte, vull dues columnes: a l'esquerra l'adreça i a la dreta un mapa.»

## Què farà l'agent

1. Et repetirà la petició amb les seves paraules i et preguntarà el que no quedi clar
   (quins idiomes, quina imatge...).
2. Mirarà com està ara la pàgina i buscarà un exemple semblant per copiar-ne l'estil.
3. T'explicarà exactament què canviarà i et demanarà confirmació.
4. Farà el canvi (primer a la còpia de proves si n'hi ha), el comprovarà i et donarà els
   enllaços per veure-ho.
5. Guardarà una còpia de seguretat de tot el que toqui, per poder-ho desfer.

Si el que demanes **no es pot fer amb els blocs actuals** (un disseny nou, una animació, un
tipus de bloc que no existeix), t'ho dirà i prepararà una descripció de la tasca per a la
persona tècnica (a `docs/tasks/`).

## Bones pràctiques

- Demana una cosa cada vegada.
- Dona exemples: «com aquesta pàgina», «com aquest bloc».
- Si vols imatges noves, passa-les a l'agent amb el nom que vulguis i digues on van.
- Revisa sempre el resultat a la web (en els tres idiomes, si n'hi ha).

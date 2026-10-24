/**
 * Help texts shown under each field in the Strapi admin (Content Manager).
 *
 * They only change what editors see in the admin: nothing here affects the
 * public website. Applied at startup by ./apply-field-help.ts.
 *
 * Keep texts short and in Catalan. Field labels are NOT changed, so the
 * user manual (docs/manual) can keep referring to the original field names.
 */

export type FieldHelp = { description?: string; placeholder?: string };
export type HelpMap = Record<string, Record<string, FieldHelp>>;

const titleHeading: FieldHelp = {
  description:
    "Mida/nivell del títol: h1 (el més gran, un per pàgina), h2, h3... o p (text normal). Si es deixa buit, el títol NO es mostra.",
};
const styles: FieldHelp = {
  description: "Aparença del bloc: colors, fons, amplada, espais i classes CSS. Veure el manual, capítol «Estils».",
};
const alias: FieldHelp = {
  description: "Nom intern per reconèixer el bloc a l'admin. No es mostra a la web.",
};
const menuSource: FieldHelp = {
  description:
    "Menú (Content Manager › Menu) que conté els elements a mostrar. Per afegir, treure o reordenar elements, edita aquest menú.",
};

export const FIELD_HELP: HelpMap = {
  // ---------------------------------------------------------------- styles
  "meta.styles": {
    cssClass: {
      description:
        "Classes separades per espais. En un BLOC: pt-0 / pb-0 (sense espai dalt/baix), blog-black, slider-three-black... En una COLUMNA defineix l'amplada en una graella de 12: col-12 col-md-6 (meitat), col-12 col-md-4 (un terç), col-12 col-md-8 offset-md-4 (2/3 a la dreta). Llista completa al manual.",
      placeholder: "ex: col-12 col-md-6",
    },
    backgroundImage: {
      description: "Imatge de fons del bloc. En una columna, imatge de fons de la columna.",
    },
    backgroundImage2: {
      description:
        "Segona imatge de fons, alineada a la dreta (meitat d'amplada). No s'aplica a pàgines d'àmbit ni de servei.",
    },
    height: {
      description: "Alçada del bloc. Ex: 450px o 75vh (75% de l'alçada de la pantalla). Buit = la que necessiti el contingut.",
      placeholder: "ex: 75vh",
    },
    textColor: {
      description:
        "light = text blanc (per a fons foscos), dark = text negre (per a fons clars). També canvia el color del logo i del menú superior.",
    },
    margin: {
      description:
        "Espai EXTERIOR (avançat). En una columna s'aplica a cada paràgraf. Format CSS: dalt dreta baix esquerra, ex: 0 0 50px 0. Normalment buit.",
      placeholder: "ex: 0 0 50px 0",
    },
    padding: {
      description:
        "Espai INTERIOR (avançat). Format CSS: dalt dreta baix esquerra, ex: 0 0 150px 0. Si s'omple, substitueix l'espai per defecte del bloc (120px dalt i baix). Normalment buit.",
      placeholder: "ex: 0 0 150px 0",
    },
    background: {
      description: "Fons CSS avançat (color, degradat...). Normalment buit: fes servir backgroundColor.",
    },
    width: {
      description: "Només té efecte als blocs Tabs (amplada de la fila, ex: 80%). En altres blocs s'ignora.",
    },
    container: {
      description:
        "Amplada màxima del contingut: full (tota la pantalla, sense marges), xxl (gairebé tota), normal / buit (estàndard, ~1300px), narrow (~900px), article (800px), small (~650px).",
    },
    sectionId: {
      description:
        "Identificador per enllaçar directament a aquest bloc (ex: serveis → enllaç #serveis). Sense espais ni accents.",
      placeholder: "ex: serveis",
    },
    backgroundColor: {
      description: "Color de fons en hexadecimal. Habituals: #000 (negre), #F2EEEA (crema), #FFFFFF (blanc).",
      placeholder: "ex: #F2EEEA",
    },
    paddingTop: {
      description: "FALSE treu l'espai superior del bloc (equival a la classe pt-0).",
    },
    paddingBottom: {
      description: "FALSE treu l'espai inferior del bloc (equival a la classe pb-0).",
    },
    listenAudioBefore: { description: "Sense efecte. No cal tocar-ho." },
    listenAudioAfter: { description: "Sense efecte. No cal tocar-ho." },
    backgroundVideo: {
      description: "Vídeo de fons en bucle i sense so (mp4). Es mostra per sobre de la imatge de fons.",
    },
    backgroundVideoMobile: {
      description: "Vídeo de fons alternatiu per a mòbil i tauleta (pantalles de 1024px o menys).",
    },
  },

  // ---------------------------------------------------------------- columns
  "meta.column": {
    title: {
      description: "Títol de la columna. Accepta <br> per partir línia. Cal triar titleHeading perquè es vegi.",
    },
    titleHeading,
    text: {
      description:
        "Text de la columna. Trucs: un paràgraf que només contingui <hr> fa una línia horitzontal; un paràgraf buit afegeix una mica d'espai.",
    },
    media: { description: "Imatge, vídeo o àudio que es mostra sota el text." },
    styles: {
      description:
        "Amplada de la columna (cssClass, ex: col-12 col-md-6), imatge de fons, padding i margin del text.",
    },
    c2a: { description: "Botó opcional sota el text (un de sol). Per posar-ne més d'un, fes servir «buttons»." },
    buttons: {
      description:
        "Botons sota el text, un sota l'altre (ex: descàrregues en diversos idiomes). Afegeix-ne tants com calgui amb «Add an entry»; els pots reordenar arrossegant. Si també hi ha c2a, aquest surt primer.",
    },
    alias,
    verticalScroller: {
      description: "Avançat: menú amb imatges que es mostren en mosaic animat al costat del text.",
    },
  },
  "sections.columns": {
    columns: {
      description:
        "Columnes del bloc, d'esquerra a dreta. Sense classes d'amplada es reparteixen a parts iguals. A mòbil sempre es posen una sota l'altra.",
    },
    styles,
    alias,
  },
  "sections.tabs": {
    tabs: { description: "Cada element és una pestanya. Fes servir titleHeading = h2 per al títol de la pestanya." },
    styles,
    alias,
  },

  // ---------------------------------------------------------------- hero
  "sections.hero": {
    title: { description: "Títol gran de capçalera. Accepta <br>. A la Home s'ignora (s'usa l'animació de Texts › home0…home9)." },
    titleHeading,
    text: { description: "Subtítol. Només títols i paràgrafs (negreta permesa)." },
    align: {
      description: "bottom-left = text a baix a l'esquerra; centered = text centrat. (post no té efecte.)",
    },
    styles: {
      description: "Habitual: height (ex: 450px o 85vh), backgroundColor, backgroundImage o backgroundVideo, textColor.",
    },
    alias,
  },

  // ---------------------------------------------------------------- lists
  "sections.slider": {
    menu: menuSource,
    preset: {
      description:
        "three = 3 targetes que roten (Caos Creatiu / Eines). one = una diapositiva gran amb imatge i text. services = targetes de colors amb fletxes. three-black = no recomanat.",
    },
    subTitle: { description: "Títol visible als presets three/buit. Als altres, petit text sobre el títol." },
    title: { description: "Títol (només es veu amb els presets one i services)." },
    goToText: { description: "Només preset one: text de l'enllaç «anar a» de cada diapositiva." },
    c2a: { description: "Només preset one: botó sota el carrusel." },
    background: { description: "Fons CSS del carrusel (avançat). Normalment buit." },
    intervalMilliseconds: { description: "Temps entre diapositives en mil·lisegons (8000 = 8 segons). No aplica a services." },
    styles: {
      description: "Per a l'estil fosc afegeix a cssClass: slider-three-black (i slider-three-black-kaos per al de Caos Creatiu).",
    },
  },
  "sections.menu": {
    menu: menuSource,
    preset: {
      description:
        "default = enllaços amb fletxa (usa el títol de cada element). tags-cloud = paraules separades per / amb imatge en passar el ratolí. marquee = cinta que es mou (text o logos). navigation-arrows = enllaços anterior/següent. title-sections = no mostra res.",
    },
    styles,
    alias,
  },
  "sections.scroller": {
    title: { description: "Títol (text pla)." },
    subtitle: { description: "Subtítol (text pla)." },
    menu: menuSource,
    preset: {
      description: "pages = targetes de pàgines (imatge de compartir + nom). images = només imatges (cal que cada element del menú tingui imatge).",
    },
    styles,
    alias,
  },
  "sections.masonry": {
    title: { description: "Títol (accepta <br>)." },
    subtitle: { description: "Text petit sobre el títol." },
    pages: {
      description:
        "SENSE EFECTE: el mosaic mostra automàticament TOTS els articles publicats (tipus article), ordenats per sortDate (més recent primer).",
    },
    filter: { description: "Mostra els filtres (àmbit, tipologia, any) i el botó «carregar més». Recomanat: TRUE." },
    pageSize: { description: "Quants articles es carreguen cada vegada (per defecte 16)." },
    noResultsImage: { description: "Imatge quan un filtre no troba resultats." },
    styles,
  },
  "sections.blog": {
    blogPage: {
      description:
        "Llista manual de pàgines. ATENCIÓ: si filter = TRUE aquesta llista s'ignora i es mostren automàticament TOTS els recursos publicats (tipus resource).",
    },
    filter: {
      description: "TRUE = llista automàtica de tots els recursos + filtres + «carregar més». FALSE = només la llista manual blogPage.",
    },
    noResultsImage: { description: "Imatge quan un filtre no troba resultats." },
    styles: { description: "Per a l'estil fosc afegeix blog-black a cssClass." },
  },
  "meta.blog-page": {
    page: { description: "Pàgina a mostrar. Es fa servir la seva imatge de compartir, nom, tipologia, any i descripció." },
    width: { description: "onethird = 1/3 d'amplada, twothirds = 2/3, threethirds = fila sencera (imatge a l'esquerra)." },
    showDescription: { description: "Sense efecte." },
  },
  "sections.blurbs": {
    title: { description: "Títol petit sobre les xifres/icones." },
    blurbs: { description: "Cada element és una columna (imatge + títol + text), totes de la mateixa amplada." },
    styles,
  },
  "meta.blurb": {
    titleHeading,
    text: { description: "Text pla (sense negretes ni enllaços)." },
    imagePosition: { description: "Sense efecte." },
    imageWidth: { description: "Sense efecte." },
    cssClass: { description: "Sense efecte." },
    svg: { description: "Sense efecte." },
    effect: { description: "Sense efecte." },
  },
  "sections.bios": {
    bios: { description: "Persones a mostrar (Content Manager › Bio). S'ordenen pel camp weight de cada Bio." },
    titleHeading,
    preset: { description: "grid = targetes amb foto. list = llista desplegable." },
    subtitle: { description: "Només preset list." },
    c2aText: { description: "Només preset list: text de l'enllaç a la fitxa." },
    styles,
  },
  "sections.capabilities": {
    capabilities: { description: "Capabilitats a mostrar (Content Manager › Capability)." },
    c2aText: { description: "Text de l'enllaç a la pàgina de cada capabilitat. Si és buit l'enllaç no es veu." },
    styles,
  },
  "sections.video": {
    image: { description: "Imatge de portada del vídeo (obligatòria per veure-ho bé)." },
    title: { description: "Text sobre la portada." },
    url: { description: "Enllaç del vídeo (YouTube https://www.youtube.com/watch?v=... o enllaç d'inserció de Vimeo)." },
    embed: { description: "Sense efecte." },
    styles,
  },
  "sections.timeline": {
    url: { description: "URL d'una línia de temps de Knightlab TimelineJS (full de Google publicat)." },
    styles,
  },
  "sections.template": {
    template: { description: "Plantilla (Content Manager › Template) els blocs de la qual s'inseriran en aquesta posició." },
    alias,
  },
  "sections.modal": {
    name: { description: "Text alternatiu de la imatge (accessibilitat)." },
    size: { description: "small = 400px, medium = 600px, large = 900px d'amplada màxima." },
    image: { description: "Imatge (o vídeo) per a ordinador. Obligatòria." },
    imageTablet: { description: "Imatge alternativa per a tauleta (opcional)." },
    imageMobile: { description: "Imatge alternativa per a mòbil (opcional)." },
    displayFrequency: {
      description: "once = només un cop per navegador, once_per_day = un cop al dia, every_reload = sempre.",
    },
    href: { description: "Enllaç en clicar la imatge (s'obre en una pestanya nova)." },
  },
  "sections.lead-form": {
    name: { description: "Títol sobre el formulari." },
    styles,
  },

  // ---------------------------------------------------------------- links
  "meta.c2-a": {
    text: { description: "Text del botó." },
    page: { description: "Pàgina interna de destí (recomanat). Si s'omple, té prioritat sobre href." },
    href: { description: "Adreça externa (https://...) o ancla (#serveis). Només si no hi ha page." },
    target: { description: "_blank = obre en una pestanya nova (només amb href)." },
    cssClass: {
      description:
        "Aspecte del botó. Per defecte: btn mt-4 btn-with-arrow-right. Fosc: afegeix btn-dark. Per a fons fosc: btn-dark-border-white. Amplada completa: w-100.",
    },
  },
  "meta.children": {
    title: { description: "Text de l'element. Si hi ha page, normalment es mostra el nom de la pàgina." },
    page: { description: "Pàgina enllaçada. Als sliders i scrollers és la que dona imatge, títol i descripció." },
    href: { description: "Adreça externa o ancla (#id). Només si no hi ha page." },
    children: { description: "Sense efecte." },
    submenu: { description: "Només al menú principal: converteix l'element en un desplegable amb els elements d'aquest altre menú." },
    image: { description: "Imatge pròpia de l'element (logos de marquee i scroller d'imatges)." },
  },

  // ---------------------------------------------------------------- metadata
  "meta.metadata": {
    metaTitle: { description: "Títol per a Google i per a la pestanya del navegador. Si és buit, s'usa el nom de la pàgina." },
    metaDescription: {
      description: "Descripció per a Google i xarxes. També és el text de les targetes (sliders, recursos).",
    },
    shareImage: {
      description:
        "Imatge en compartir a xarxes. IMPORTANT: també és la imatge de la pàgina als sliders, al mosaic de Caos Creatiu i a la llista d'Eines.",
    },
    noIndex: { description: "Sense efecte actualment." },
    metaDescriptionShort: { description: "Descripció curta que es mostra a les targetes dels sliders i de recursos." },
  },

  // ---------------------------------------------------------------- page
  "api::page.page": {
    name: { description: "Títol de la pàgina (s'usa als sliders, menús i targetes)." },
    slug: {
      description: "Part final de l'adreça web (sense espais ni accents). Canviar-lo trenca els enllaços externs existents.",
    },
    type: {
      description:
        "article = surt a Caos Creatiu (/article/...). resource = surt a Eines disruptives (/recurs/...). page = pàgina normal. Canviar-lo canvia l'adreça.",
    },
    sections: {
      description: "Blocs de la pàgina, de dalt a baix. Arrossega per reordenar. El botó … de cada bloc permet duplicar-lo.",
    },
    pageCss: { description: "Avançat: classe CSS que s'afegeix a tota la pàgina." },
    headerColorMode: {
      description: "Color inicial del menú superior: light = blanc (si la pàgina comença amb fons fosc), dark = negre.",
    },
    sortDate: {
      description: "Data per ordenar els articles a Caos Creatiu (més recent primer). Es posa sola en crear la pàgina.",
    },
    scopes: { description: "Àmbits: s'usen als filtres de Caos Creatiu i Eines." },
    typology: { description: "Tipologia (Article, Guia...): filtre i etiqueta de les targetes." },
    year: { description: "Any: filtre i etiqueta de les targetes." },
    author: { description: "Autoria (text lliure). Es mostra a la fitxa d'informació si hi ha plantilla {type}-information." },
    audio: { description: "Àudio «Escolta» de la pàgina (articles, recursos, serveis i capabilitats)." },
    tags: { description: "Etiquetes de la fitxa d'informació." },
    metaColor: { description: "Sense efecte visible actualment." },
    readTime: { description: "Sense efecte visible actualment." },
    client: { description: "Text sota el nom a les targetes del Scroller (preset pages)." },
  },
  "api::menu.menu": {
    title: { description: "Nom intern del menú (per trobar-lo des dels blocs). No es mostra a la web." },
    children: {
      description:
        "Elements del menú, en ordre (arrossega per reordenar). Als sliders cada element és una targeta: tria la page i posa el seu nom a title perquè la fila tingui nom aquí. Els menús no tenen esborrany: en desar, el canvi ja és a la web.",
    },
  },
  "api::template.template": {
    name: {
      description:
        "Nom de la plantilla. Noms especials: «article», «resource», «scope»... s'afegeixen al final de totes les pàgines d'aquest tipus; «all» al final de totes; «article-information» / «resource-information» = fitxa d'informació.",
    },
    sections: { description: "Blocs de la plantilla. Canviar-los afecta totes les pàgines que la fan servir, a l'instant (les plantilles no tenen esborrany)." },
  },
  "api::header.header": {
    css: {
      description: "Avançat: CSS global que s'aplica a totes les pàgines. Un error aquí pot afectar tota la web.",
    },
    seoTitleSufix: { description: "Text que s'afegeix al final de tots els títols (inclou l'espai inicial, ex: « | Resilience Earth»)." },
    logo: { description: "Logo sobre fons clars." },
    logoDark: { description: "Logo sobre fons foscos (versió blanca)." },
    mainMenu: { description: "Menú principal (pantalla completa)." },
    secondaryMenu: { description: "Enllaços petits a la part inferior del menú." },
    contact: { description: "Text de contacte del menú (accepta HTML)." },
    gtmId: {
      description:
        "Codi de Google Tag Manager (ex: GTM-ABC1234). Buit = la web no carrega cap analítica ni mostra el bàner de galetes. Si s'omple, apareix el bàner i Tag Manager només es carrega quan el visitant accepta. És el mateix per a tots els idiomes.",
      placeholder: "GTM-XXXXXXX",
    },
    cookieText: {
      description:
        "Text del bàner de galetes (accepta HTML, ex: un enllaç a la política de privacitat). Buit = text per defecte. Només es mostra si hi ha codi GTM.",
    },
    cookieAccept: { description: "Botó «Acceptar» del bàner de galetes. Buit = text per defecte." },
    cookieReject: { description: "Botó «Rebutjar» del bàner de galetes. Buit = text per defecte." },
    cookieSettings: {
      description: "Enllaç del peu de pàgina per tornar a obrir el bàner i canviar l'elecció. Buit = «Configuració de galetes».",
    },
  },
};

# resilience.earth — instructions for an AI agent that edits website content

You are helping a **non-technical person** change the content of https://resilience.earth.
They will describe what they want in plain language (usually Catalan). Your job is to turn
that into safe, minimal content changes in the Strapi CMS, verify them, and explain the
result in plain language — or to explain that the request needs a developer and write a
task file for one.

Read this whole file before acting. The human-oriented manual (Catalan, with screenshots)
is in `../manual/` — it is the reference for *how the site works*; this file is the
reference for *how you operate*.

---

## 0. Golden rules

1. **Never change production without the person's explicit "yes"** to a concrete, plain
   description of the change (which page, which language, what will look different).
2. **Back up before every write.** The CLI does it automatically (`./rw-backups/`). If you
   write with raw HTTP, `GET` the document and save it to a file first.
3. **Smallest possible change.** Do not "tidy up" other fields, do not reformat texts, do
   not normalise CSS classes you were not asked to touch.
4. **Copy, don't invent.** New pages are created by cloning an existing page of the same
   kind and replacing texts/images. New blocks copy the `styles` of an equivalent block on
   another page. Never invent CSS class names: only use classes listed in
   `../manual/05-estils.md` or already present in the content.
5. **Never delete** pages, menus, templates or media unless explicitly asked; prefer
   unpublishing / removing from a menu.
6. **Do not touch** without explicit, specific instruction: `Header.css` (global CSS),
   the names of templates, `type`/`slug` of published pages (changes URLs), users,
   roles, API tokens, plugin settings, `EmailConfig`.
7. **Languages are separate documents.** A change in Catalan does not change Spanish or
   English. Always ask (or state) which languages are affected, and never machine-translate
   technical fields (`cssClass`, `container`, `sectionId`, colours, sizes).
8. **If the request cannot be done with the existing blocks, say so** and write a task file
   (section 9). Do not try to fake new designs with raw HTML or global CSS.

---

## 1. Environments and access

| Environment | API base URL | Admin | Notes |
|---|---|---|---|
| Production | `https://api-w.resilience.earth` | `/admin` | Public site: `https://resilience.earth` |
| **Test** (default for trying changes) | `https://w.resilience.earth` | `/admin` | Front end https://w.resilience.earth (password protected, not indexed). Copy of production data. |

- **Reading** (pages, menus, published content) needs no token.
- **Writing** needs an API token (`RW_API_TOKEN`) created by the developer in Strapi
  (*Settings → API Tokens*, type *Full access* or *Custom* with `page`, `menu`, `template`
  and `upload` permissions). Never print the token, never commit it.
- **Templates** cannot be read by the public role: use the token, or the public custom
  route `GET /api/pages/templates/<name>?locale=xx` (read-only, already populated).
- **Do every change on test first**, let the person check it on https://w.resilience.earth,
  then repeat it on production. Test and production use **different tokens**. If test data is
  out of date with production, ask the developer to refresh it.
- Test does not send e-mails (forms save the entry but show an error). Files uploaded in test
  exist only in test: upload them again to production and use the production file ids.
- If test is not available, explain the change precisely, get approval, apply it to
  production, verify immediately, and keep the backup path handy to revert.

---

## 2. Tools

### 2.1 `rw-content` CLI (preferred)

A dependency-free Node ≥18 script: `tools/content-cli/rw-content.mjs` in the backend repo
(`https://github.com/zarpilla/resilience-web-backend`). If you don't have the repo, ask the
developer for this single file. Docs: [tools/content-cli/README.md](../../tools/content-cli/README.md).

```bash
export RW_API_URL=https://w.resilience.earth       # TEST (default). Production: https://api-w.resilience.earth
export RW_API_TOKEN=...                            # token of THAT environment (never print it)
node rw-content.mjs help
node rw-content.mjs list --type article            # newest first
node rw-content.mjs show <slug>                    # human summary of a page (blocks, styles)
node rw-content.mjs export <slug> --out page.json  # editable JSON
node rw-content.mjs clone <slug> --name "New title"           # new DRAFT page copied from <slug>
node rw-content.mjs push page.json --document <documentId>    # replace a page (draft)
node rw-content.mjs publish <slug>
node rw-content.mjs menus | menu "<title>"
node rw-content.mjs menu-add "<menu>" --page <slug> --at 0 --title "<label>"
node rw-content.mjs menu-remove "<menu>" --index N
node rw-content.mjs menu-move "<menu>" --from N --to M
node rw-content.mjs template <name> | template-export <name> --out t.json | template-push t.json --name <name>
node rw-content.mjs media "<part of file name>"
node rw-content.mjs upload ./image.jpg --alt "description"   # file type from the extension; --replace <id> keeps the id
node rw-content.mjs taxonomies                     # scopes, typologies, years, tags with their documentIds
node rw-content.mjs bios | bio-export <slug> --out b.json | bio-push b.json --new|--document <id> --publish
node rw-content.mjs team-add <bio-slug> | team-remove <bio-slug>   # "Qui som" page AND template "bio" (published, LIVE)
node rw-content.mjs verify <slug> [--locale es]    # published? files OK? position in lists? which sliders/menus?
node rw-content.mjs texts <slug> --out t.json      # translatable texts → translate values → texts-apply <slug> t.json --locale es --publish
```

All commands take `--locale ca|es|en` (default `ca`). Writes to a non-localhost URL require
`--yes` (add it only after the person approved).

### 2.2 Raw REST (if you cannot run the CLI)

Strapi 5 REST rules that matter here:

- Documents are addressed by `documentId` (24 chars), plus `?locale=xx`.
- `GET /api/pages?filters[slug][$eq]=<slug>&filters[type][$eq]=<type>&locale=ca&status=draft|published&populate=...`
- `GET /api/pages/sections/<documentId>?locale=ca` — custom route: page + all blocks fully
  populated (and `sections.template` blocks expanded). Read-only. Returns the **published**
  version (`&status=draft` with an API token returns the draft — useful to preview).
- `PUT /api/pages/<documentId>?locale=ca&status=draft` `{ "data": { ... } }` — update draft.
  Use `status=published` to publish in the same call.
- `POST /api/pages?locale=ca&status=draft` `{ "data": { ... } }` — create.
- `PUT /api/menus/<documentId>?locale=ca` / `PUT /api/templates/<documentId>?locale=ca` — no drafts.
- With `curl`, use `-g` (URLs contain `[` `]`) and, for uploads, set the type:
  `-F "files=@photo.jpg;type=image/jpeg"`.
- `POST /api/upload` (multipart `files`) → returns file `id`.
- **Payload rules:** a dynamic zone (`sections`) or repeatable component (`columns`,
  `children`) is **replaced entirely** — always send the full array. **Do not send
  component `id`s** (rejected: "Invalid key id"); components are recreated. Media fields take
  the file **id** (number). Relations take `{ "set": [ { "documentId": "..." } ] }`
  (or `{ "set": [] }` to clear). Keep `null` values as `null` (booleans `null` ≠ `false`:
  `paddingTop: false` removes the top spacing, `null` keeps it). Rich-text `text` fields are
  arrays of blocks: copy them as-is and only edit the `text` leaves.

---

## 3. How the site works (what you must know)

### 3.1 Pages

Collection `api::page.page` (draft & publish, i18n ca/es/en). Key fields: `name`, `slug`,
`type`, `metadata` (component: `metaTitle`, `metaDescription`, `metaDescriptionShort`,
`shareImage`), `sections` (dynamic zone = the blocks), `headerColorMode` (light|dark),
`typology`, `year`, `scopes`, `tags`, `author`, `audio`, `sortDate`, `pageCss`.

| type | URL ca / es / en | Shows up automatically in |
|---|---|---|
| page | `/slug` · `/es/slug` · `/en/slug` (slug `home` = `/`) | — |
| article | `/article/` · `/es/articulo/` · `/en/article/` | Masonry (Caos Creatiu page + Home), newest `sortDate` first |
| resource | `/recurs/` · `/es/recurso/` · `/en/resource/` | Blog with `filter=true` (Eines disruptives), newest `sortDate` first |
| scope | `/ambit/` · `/es/ambito/` · `/en/scope/` | — |
| service | `/servei/` · `/es/servicio/` · `/en/service/` | — |
| capability | `/capabilitat/` · `/es/capabilidad/` · `/en/capability/` | — |
| project | `/projecte/` · `/es/proyecto/` · `/en/project/` | — |

`metadata.shareImage` is also the **card image** everywhere (masonry, sliders, blog), and
`metaDescriptionShort` / `metaDescription` are card texts. Articles use portrait 4:5 images
(1080×1350), resources landscape 4:3 (1024×768).

### 3.2 Draft vs published

- The site renders the **published** version of pages (and of the bios, pages, etc. they link to).
  Writing a draft (`push` without `--publish`) is safe: nothing changes on the site until
  `publish`. Use this to prepare changes and let the person review them in the admin.
- Lists (Masonry, Blog, filters) query published pages only.
- **Menus and templates have no draft/publish**: every save is live.
- A new page must be **published** to appear anywhere.
- Anonymous API calls can only read published content; reading drafts needs the token.
- Strapi's admin "Duplicate" copies `sortDate`: set it to now for new articles.
- (Before task 001 was deployed — October 2026 — the site rendered drafts. If you see drafts
  live, the deployment is older: then treat every page write as live.)

### 3.3 Automatic additions by the front end (`components/AppPage.vue`)

- Template named `{type}-information` (exists for `article`, `resource`): its first section's
  two columns are **prepended** to the page's **2nd** section (**3rd** for `resource`) *if
  that section is `sections.columns`*. Placeholders `{type} {scopes} {authors} {year} {tags}`
  are replaced by the page's typology/scopes/author/year/tags. ⇒ keep article section #2 and
  resource section #3 as Columns.
- Template named exactly like the page `type` (`article`, `resource`, `scope`, `service`,
  `capability`; `bio` for bios) is **appended** at the end of every page of that type; a
  template named `all` would be appended to every page.
- Audio "Listen" button (`page.audio`) is injected: article/service → after the first Hero;
  resource → before the last column of section #3; capability → before the first column of
  section #2.
- Home hero: title/text ignored; typing animation from single type `Text` fields `home0..home9`
  (`home1` effect is hard-coded for 16 characters — do not change it).

### 3.4 Blocks (dynamic zone components)

Full per-field reference: `../manual/04-blocs.md`. Summary:

| Component | Content source | Key fields |
|---|---|---|
| `sections.hero` | own fields | `title`, `titleHeading` (empty ⇒ title hidden), `text` (headings/paragraphs only), `align` (bottom-left/centered), `styles.height`, background image/video |
| `sections.columns` | own fields | `columns[]` each: `title`, `titleHeading`, `text` (rich text), `media`, `c2a`, `buttons[]` (more buttons, same shape as `c2a`, rendered after it), `styles.cssClass` (= **grid width**), `styles.padding/margin` (applied per paragraph) |
| `sections.slider` | **a Menu** (`menu`) → each child's `page` | `preset` (`three` / `services` / `one`), `subTitle` (visible title in `three`), `intervalMilliseconds`; dark look via cssClass `slider-three-black` (+ `slider-three-black-kaos orange-titles` for Caos Creatiu) |
| `sections.menu` | a Menu | `preset`: `default` (child `title` only), `tags-cloud`, `marquee` (child `image` = logos), `navigation-arrows`; `title-sections` renders nothing |
| `sections.masonry` | **all published articles** (`pages` field ignored) | `filter` (keep true: enables load-more), `pageSize` |
| `sections.blog` | `filter=true`: **all published resources**; `filter=false`: `blogPage[]` | `blogPage[].width` onethird/twothirds/threethirds |
| `sections.template` | a Template | `template` |
| `sections.video` | own | `image` (poster), `title`, `url` (YouTube/Vimeo embed) |
| `sections.blurbs` | own | `blurbs[]`: `image`, `title`, `titleHeading`, `text` (plain) |
| `sections.bios` | Bio relations | `preset` grid/list; order by Bio `weight` |
| `sections.capabilities` | Capability relations | `c2aText` (empty ⇒ invisible link) |
| `sections.tabs` | own | `tabs[]` like columns; use `titleHeading: h2` |
| `sections.timeline` | TimelineJS URL | `url` |
| `sections.lead-form` | Text single type labels | `name` |
| `sections.modal` | own | `image` (required), `size`, `displayFrequency`, `href`; place at the end of the page |
| `sections.scroller`, `sections.ecosystem` | — | not used on the site |

Fields marked "Sense efecte" in the admin descriptions are ignored by the front end.

### 3.5 Styles (`meta.styles`) and layout

On a **section**: `cssClass`, `container` (full | xxl | normal/empty | narrow ~900px |
article 800px | small ~650px), `textColor` (`light` on dark backgrounds — also switches the
header logo/colour), `backgroundColor` (`#000`, `#F2EEEA` cream, `#FFFFFF`), `backgroundImage`,
`backgroundImage2` (right half), `backgroundVideo(+Mobile)`, `height` (`450px`, `75vh`),
`padding` / `margin` (CSS shorthand, overrides the default 120px vertical padding),
`paddingTop` / `paddingBottom` (`false` ⇒ `pt-0`/`pb-0`), `sectionId` (anchor). `width`
only works on Tabs.

On a **column** (`columns[].styles`): `cssClass` defines the Bootstrap 12-column grid width,
e.g. `col-12 col-md-6`, `col-12 col-md-8 offset-md-4`, `col-12 col-lg-7`; numbers + offsets in
one row should sum ≤ 12. Without classes columns share the width equally. Plus helper classes:
`media-border-radius`, `img-wb-filter`, `img-height-75`, `h2-with-arrow-down`, `orange-titles`,
`fixed-when-scroll`, Bootstrap spacing `pt-N pb-N mt-N mb-N` (N 0–5), `ms-auto`, `text-center`.
Section-level helpers: `pt-0 pb-0 py-0 pt-80px mb-120px mt-150-n bg-cover bg-no-repeat
blog-black slider-three-black slider-three-black-kaos orange-titles h3-normal h2-mb-2
width-pct80 width-pct50 all-media-same-height d-none`. Classes starting with `z` are
intentionally disabled — leave them. Buttons (`c2a.cssClass`): see `../manual/05-estils.md#7-botons`.

Rich text tricks: a paragraph containing only `<hr>` ⇒ horizontal rule; inline HTML
`<span class="orange">`, `<cite>`, `<br>`, `<a href target="_blank">` is rendered.
Numbered lists render as bullets; images/quotes/code inside rich text are not rendered.

### 3.6 Menus that drive sliders and navigation

| Where | Menu (ca title) | documentId |
|---|---|---|
| "Caos creatiu" slider (Eines disruptives page, end of every article & capability) | Caos Creatiu | `gqv00trkvvkoxn857mvtpt6d` |
| "Eines disruptives…" slider (Home, end of every resource, scope pages) | Recursos per catalitzar les teves iniciatives | `y2aw8oj7bwm51yv8m2u3l9e8` |
| "Serveis" slider (Home) | Serveis | `feyjadl4gz208kvqqz8rwmo9` |
| "Serveis" slider (scope & service templates) | Serveis | `jp5o80ykwed55h2vqauhp3rt` |
| Main menu (Header.mainMenu) | Main Menu | — |
| Header.secondaryMenu and Footer.menu | Secondary | — |

Menu titles are translated ("Caos Creatiu" / "Caos Creativo" / "Caos Creative"): the CLI finds
a menu by its Catalan title in any locale, or use the documentId.
documentIds are the same for the es/en versions of a menu; each locale has its **own list of
children** that must be edited separately (pointing to the page translations). Verify IDs
with `rw-content menus` — they may change.

Menu child (`meta.children`): `title`, `page` (relation, preferred), `href`, `submenu`
(main menu only), `image` (marquee logos). Fill `title` with the page name even in sliders:
it is not displayed there but labels the row in the admin.

### 3.7 How cards crop images

| Where | Image | Visible area (width / height) |
|---|---|---|
| Caos Creatiu / Home mosaic | article `shareImage` (portrait 4:5) | ~0.65 → the sides are cut: keep text/faces 15% away from left and right edges |
| Sliders (`three`) | page `shareImage` | ~1.37 (landscape) |
| Eines disruptives list | resource `shareImage` (4:3) | ~1.22 |
| Team grid | Bio `mainImage` | ~1:1 (existing portraits are black & white, on a light background) |

The mosaic fills its columns right to left: the newest article appears top-right.

### 3.8 Pages most edited

- Caos Creatiu: `/caos-creatiu` (Hero + Masonry) — content comes from article pages.
- Eines disruptives: `/eines-disruptives` (Hero + Blog filter=true + Caos Creatiu slider).
- Home: `slug=home` (13 blocks; see `rw-content show home`).

---

## 4. Standard workflow

1. **Understand** the request. Restate it in one or two plain sentences. Identify: page(s)
   (URL), language(s), block(s), and whether it is new content or a change.
2. **Inspect** current content: `show <slug>` (and `--locale es/en`), `menu "<title>"`,
   `template <name>`. Find a similar existing example to copy from.
3. **Classify**:
   - *Content-only* (texts, images, links, new article/resource, slider cards, menus,
     reordering, styles using existing classes) → continue.
   - *Needs code* (new block type, new layout/animation, new field, behaviour change,
     anything you'd need new CSS/JS for) → step 9.
4. **Plan** in plain language for the person: what will change, where, which languages,
   whether it is live immediately (published page/menu/template) or a draft.
5. **Test first**: apply on test, then run the checklist below on the test front end and
   send the person the test links.
6. **Ask for approval** for production, then apply with `--yes`. New pages: create as draft,
   show the admin link, publish only after approval.
7. **Verify** on the live site (fetch the URL / take a screenshot; for lists check the
   Caos Creatiu / Eines pages). Check all affected languages.
8. **Report** in plain language: what changed, links to the pages, where the backup is, and
   anything left to do (e.g. translations).

### Checklist after every change (on test, then again on production)

Start with `verify <slug>` (and `--locale es/en`): it checks publication, files, list position
and menus. Then, if you can open the front end, look at it. If you cannot (no browser, test
front end unreachable), say so to the person and rely on `verify`.

- Open the page (and its es/en versions if touched). If you can, take a screenshot.
- Every image loads: in a browser `document.images` all have `naturalWidth > 0`. An image
  stored as `application/octet-stream` is not shown by the site (`upload` sets the right type;
  if one is wrong, `upload <file> --replace <id>`).
- The lists that should show it: Caos Creatiu mosaic and Home mosaic (articles), Eines
  disruptives list (resources), the slider you added it to, "Qui som" and a `/bio/...` page
  (people). Check on a phone-sized viewport too (390 px).
- Images that contain words (covers, posters) must be in the page's language: an es/en version
  that reuses a Catalan image with text needs its own image.
- Nothing copied from the original page is left (description, share image, author, tags,
  scopes, audio, texts) — `clone` copies all of it.

### Reverting

Every write command saves the previous version to `rw-backups/<time>_<kind>_<documentId>_<locale>.json`.
To undo: `node rw-content.mjs restore rw-backups/<file>.json --yes` (pages are restored as
draft — which is what the site renders; add `--publish` to also publish). With raw REST,
rebuild the payload from the backup: drop `id`, `documentId`, `createdAt`, `updatedAt`,
`publishedAt`, `locale`, `localizations` and every component `id`; media → file id;
relations → `{ "set": [ { "documentId": … } ] }`.

---

## 5. Recipes

### 5.1 New Caos Creatiu article

1. `list --type article` → pick a recent, similar article (`show` it).
2. `clone <slug> --name "<title>"` → new draft (copies blocks, styles, typology, scopes,
   tags, author; sets new slug and `sortDate=now`, `metaTitle=name`).
3. `export <new-slug> --out a.json`; edit: Hero `title`/`text`/`styles.backgroundImage`
   (image id), columns texts and media, `metadata.metaDescription(Short)`,
   `metadata.shareImage` (portrait 4:5), `author`, `scopes`, `tags`, `year`, `audio`
   (remove if not provided). Upload new images with `upload`. Use `taxonomies` for ids.
4. `push a.json --document <id>` → review in admin/dev → `publish <new-slug>`.
5. Optional: `menu-add "Caos Creatiu" --page <new-slug> --at 0 --title "<title>"`.
6. Optional translations: `texts <slug> --out t.json` → translate the VALUES (keep keys; give
   `/slug` a slug in that language) → `texts-apply <slug> t.json --locale es --publish`. It
   builds the es version from the Catalan structure (styles and images untouched). Then add it
   to the es/en versions of the menus (`menu-add` accepts the Catalan menu title) and replace
   images that contain Catalan text.
7. "Put it in Caos Creatiu" may mean the mosaic (automatic once published) or the black
   "Caos Creatiu" slider (menu, manual). If unclear, ask; if you do both, say so.

### 5.2 New Eines disruptives resource

Same as 5.1 with `--type resource`; shareImage landscape 4:3; download buttons are column
`c2a` (first) + `buttons[]` (the rest, all in the same column — do not add one Columns block
per button any more) with `href` to an uploaded PDF URL and `target: "_blank"`; section #3 must stay a
Columns block. Optional slider menu: "Recursos per catalitzar les teves iniciatives".
A PDF uploaded on test has a test URL (`https://w.resilience.earth/uploads/...`): on production
upload it again and use the production URL (`https://api-w.resilience.earth/uploads/...`).
The list is ordered by `sortDate` (newest first): set it to choose the position.

### 5.3 Slider cards

`menu-add` / `menu-remove` / `menu-move` on the slider's menu (find it via `show <page>` →
`menu:` line, or table 3.6). Repeat per locale with the translated page. Live immediately.

### 5.4 Change a text or image on a page

`export` → edit the exact leaf → `push --document <id>` (published page ⇒ live) → if the
page is published and you want the published version in sync, `publish`. Mention to the
person that the change is visible right away.

---

### 5.5 Team members (Bios)

People are `api::bio.bio` documents (draft & publish, i18n). The "Totes les que hi participem"
grid exists in TWO independent places that must be kept in sync: the `sections.bios` block of
page `qui-som` (es `quienes-somos`, en `who-we-are`) and the `sections.bios` block of template
`bio` (appended to every `/bio/<slug>` page). Scope pages have their own `sections.bios` (preset
`list`). Order is the Bio `weight` (ascending, missing = 100). A Bio must be published (and
exist in that locale) to be shown. Unpublishing a Bio hides it everywhere.

1. `bios` → pick a similar person → `bio-export <slug> --out b.json`.
2. Edit `name`, `slug`, `position`, `title` (the quote), `excerpt`, `content`, `more1..3` (keep the
   formatting of the copied Bio), `mainImage` (square-ish portrait, black & white like the others),
   `largeImage` (landscape), `weight`, `scopes`; drop `audio`, `signature` and `metadata` values
   that belong to the other person.
3. `bio-push b.json --new --publish` → `team-add <new-slug>` (adds it to the "Qui som" page and to
   the template `bio`, publishes the page: LIVE; idempotent). `team-remove` does the opposite.
4. Repeat per locale (`--locale es/en`: translated Bio, then `team-add --locale es/en`).

## 6. Things that are NOT possible without code (send to step 9)

- New block types, new presets, new animations, new card designs, new fonts.
- Changing what a block shows (e.g. titles under Masonry images, descriptions in sliders,
  order rules of Masonry/Blog, filters).
- Opening menu links in a new tab; duplicating a single block in the admin.
- New CSS classes (they require editing `Header.css` — developer only).
- Forms other than the existing contact/newsletter forms.

---

## 7. Known issues (do not "fix" silently)

See `../tasks/`. In particular: translation audit (task 007).

---

## 8. Communicating with the person

- Plain language, their language (usually Catalan). No jargon: say "bloc", "columna",
  "targeta del slider", "esborrany", not "dynamic zone" or "component".
- Always give clickable links: the public page and the admin page.
- When something is ambiguous (which page? which languages? which image?), ask one short
  question with your recommended option.
- When you are done, list what changed and what is still pending.

---

## 9. When a new component or code change is needed

Tell the person clearly: *«Això no es pot fer amb els blocs actuals de la web; cal una
petita feina de programació. He preparat una descripció de la tasca per a la persona
tècnica.»* Then create a task file:

- With the repo: `docs/tasks/NNN-short-title.md` (next free number) using
  [`../tasks/TEMPLATE.md`](../tasks/TEMPLATE.md).
- Without the repo: output the same Markdown in the chat so the person can forward it.

Fill it with: the person's request in their words, the page(s)/URLs, screenshots or
references they gave, what exists today (closest blocks and why they don't fit), a
proposed solution (schema fields to add in `src/components/...json`, front-end component
`components/Sections*.vue`, CSS), acceptance criteria, and anything you prepared in content
(e.g. a draft page) so the developer can continue.

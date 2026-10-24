#!/usr/bin/env node
/**
 * rw-content — small CLI to read and edit resilience.earth content through the
 * Strapi 5 REST API. No dependencies (Node >= 18).
 *
 * Config (env vars):
 *   RW_API_URL    Strapi base URL. Default http://localhost:1337
 *                 Production: https://api-w.resilience.earth
 *   RW_API_TOKEN  Strapi API token. Only needed for write commands
 *                 (Settings > API Tokens, type "Full access" or "Custom").
 *
 * Safety rules built in:
 *   - Page writes go to the DRAFT version unless --publish is passed; the site
 *     shows published versions only, so drafts are safe to prepare and review.
 *     Menus and templates have no draft at all: every write is live.
 *   - Writing to a non-localhost URL asks for --yes (or RW_YES=1).
 *   - `backup` / automatic backups: every update first saves the current
 *     version of the document to ./rw-backups/.
 *
 * Run `node rw-content.mjs help` for the list of commands.
 */

import fs from "node:fs";
import path from "node:path";

const API = (process.env.RW_API_URL || "http://localhost:1337").replace(/\/$/, "");
const TOKEN = process.env.RW_API_TOKEN || "";
const BACKUP_DIR = process.env.RW_BACKUP_DIR || path.resolve("rw-backups");
const LOCALES = ["ca", "es", "en"];

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const cmd = argv[0];
const pos = [];
const opt = {};
for (let i = 1; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--")) {
    const k = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) opt[k] = true;
    else {
      opt[k] = next;
      i++;
    }
  } else pos.push(a);
}
const locale = opt.locale || "ca";
// Drafts can only be read with a token (anonymous reads are published-only).
const status = opt.status || (TOKEN ? "draft" : "published");

// ---------------------------------------------------------------------------
// http helpers
// ---------------------------------------------------------------------------
function qs(obj, prefix = "") {
  const parts = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") parts.push(qs(v, key));
    else parts.push(`${encodeURIComponent(key).replace(/%5B/g, "[").replace(/%5D/g, "]")}=${encodeURIComponent(v)}`);
  }
  return parts.filter(Boolean).join("&");
}

async function http(method, url, body, { auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (TOKEN && (auth || method !== "GET")) headers.Authorization = `Bearer ${TOKEN}`;
  if (TOKEN && method === "GET") headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(API + url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) {
    const msg = json?.error ? JSON.stringify(json.error, null, 2) : text;
    throw new Error(`${method} ${url} -> ${res.status}\n${msg}`);
  }
  return json;
}

function assertWritable() {
  if (!TOKEN) die("RW_API_TOKEN is not set. Write commands need an API token.");
  const local = /localhost|127\.0\.0\.1/.test(API);
  if (!local && !(opt.yes || process.env.RW_YES === "1")) {
    die(
      `Refusing to write to ${API} without --yes.\n` +
        `Check the change on a local/dev copy first, then repeat with --yes.`
    );
  }
}

function die(msg) {
  console.error("ERROR: " + msg);
  process.exit(1);
}
const out = (x) => console.log(typeof x === "string" ? x : JSON.stringify(x, null, 2));

// ---------------------------------------------------------------------------
// populate (mirrors src/api/page/controllers/page.ts, but keeps
// sections.template as-is instead of expanding it)
// ---------------------------------------------------------------------------
// Kept short on purpose: production sits behind nginx, which rejects very long URLs.
const stylesPop = { populate: "*" };
const columnPop = {
  populate: {
    media: true,
    styles: stylesPop,
    c2a: { populate: { page: true } },
    buttons: { populate: { page: true } },
    verticalScroller: true,
  },
};
const pageRef = true;
const sectionsOn = {
  "sections.hero": { populate: { styles: stylesPop } },
  "sections.columns": { populate: { styles: stylesPop, columns: columnPop } },
  "sections.tabs": { populate: { styles: stylesPop, tabs: columnPop } },
  "sections.blog": {
    populate: { styles: stylesPop, blogPage: { populate: { page: pageRef } }, noResultsImage: true },
  },
  "sections.masonry": {
    populate: { styles: stylesPop, pages: { populate: { page: pageRef } }, noResultsImage: true },
  },
  "sections.menu": { populate: { styles: stylesPop, menu: true } },
  "sections.slider": {
    populate: {
      styles: stylesPop,
      c2a: { populate: { page: pageRef } },
      menu: true,
    },
  },
  "sections.scroller": { populate: { styles: stylesPop, menu: true } },
  "sections.blurbs": { populate: { styles: stylesPop, blurbs: { populate: { image: true } } } },
  "sections.bios": { populate: { styles: stylesPop, bios: true } },
  "sections.capabilities": {
    populate: { styles: stylesPop, capabilities: true },
  },
  "sections.timeline": { populate: { styles: stylesPop } },
  "sections.template": { populate: { template: true } },
  "sections.video": { populate: { image: true, styles: stylesPop } },
  "sections.ecosystem": { populate: { styles: stylesPop } },
  "sections.lead-form": { populate: { styles: stylesPop } },
  "sections.modal": { populate: { image: true, imageTablet: true, imageMobile: true } },
};
const pagePopulate = {
  metadata: { populate: { shareImage: true } },
  sections: { on: sectionsOn },
  tags: { fields: ["name", "slug"] },
  scopes: { fields: ["name"] },
  typology: { fields: ["name"] },
  year: { fields: ["name"] },
  audio: true,
  localizations: { fields: ["slug", "locale", "name"] },
};
const templatePopulate = { sections: { on: { ...sectionsOn } } };
delete templatePopulate.sections.on["sections.template"];

// ---------------------------------------------------------------------------
// lookups
// ---------------------------------------------------------------------------
const looksLikeDocId = (s) => /^[a-z0-9]{24}$/.test(s);

async function findPage(ref, { loc = locale, st = status, type = opt.type } = {}) {
  const filters = looksLikeDocId(ref) ? { documentId: { $eq: ref } } : { slug: { $eq: ref } };
  if (type) filters.type = { $eq: type };
  const q = qs({ locale: loc, status: st, filters, populate: pagePopulate });
  const res = await http("GET", `/api/pages?${q}`);
  if (!res.data.length) die(`Page "${ref}" not found (locale=${loc}, status=${st}).`);
  if (res.data.length > 1)
    console.error(`WARNING: ${res.data.length} pages match "${ref}", using the first one.`);
  return res.data[0];
}

async function findMenu(ref, { loc = locale, st = status } = {}) {
  const filters = looksLikeDocId(ref) ? { documentId: { $eq: ref } } : { title: { $eq: ref } };
  const q = qs({
    locale: loc,
    status: st,
    filters,
    populate: { children: { populate: { page: pageRef, image: true, submenu: true } } },
  });
  const res = await http("GET", `/api/menus?${q}`);
  if (!res.data.length) {
    // menu titles are translated ("Caos Creatiu" / "Caos Creativo"): find it by title in any locale
    if (!looksLikeDocId(ref)) {
      for (const other of LOCALES.filter((l) => l !== loc)) {
        const r = await http("GET", `/api/menus?${qs({ locale: other, filters: { title: { $eq: ref } }, fields: ["title"] })}`);
        if (r.data.length) return findMenu(r.data[0].documentId, { loc, st });
      }
    }
    die(`Menu "${ref}" not found (locale=${loc}).${TOKEN ? "" : " Menus need RW_API_TOKEN."}`);
  }
  return res.data[0];
}

async function findTemplate(name, { loc = locale } = {}) {
  if (!TOKEN) die("reading templates in full needs RW_API_TOKEN (the public role cannot list templates)");
  const q = qs({ locale: loc, filters: { name: { $eq: name } }, populate: templatePopulate });
  const res = await http("GET", `/api/templates?${q}`);
  if (!res.data.length) die(`Template "${name}" not found (locale=${loc}).`);
  return res.data[0];
}

const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", pdf: "application/pdf", mp4: "video/mp4", webm: "video/webm", mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav" };
const mimeOf = (file) => MIME[path.extname(file).slice(1).toLowerCase()] || "application/octet-stream";

async function printMenu(ref) {
  const m = await findMenu(ref, { st: "published" });
  (m.children || []).forEach((c, i) =>
    out(`  [${i}] ${c.page ? `page:${c.page.slug} (${c.page.type})` : ""}${c.title ? ` title="${c.title}"` : ""}${c.href ? ` href=${c.href}` : ""}`)
  );
}

// Bios (team members). The "Totes les que hi participem" grid lives in TWO places:
// the Bios block of the "Qui som" page and the Bios block of the template "bio".
const TEAM_PAGE = process.env.RW_TEAM_PAGE || "gse69ujgm38z247nh15idw5c"; // qui-som / quienes-somos / who-we-are
const bioPopulate = { mainImage: true, largeImage: true, signature: true, audio: true, scopes: true, metadata: { populate: "*" } };
async function findBio(ref, { loc = locale, st = status } = {}) {
  const filters = looksLikeDocId(ref) ? { documentId: { $eq: ref } } : { slug: { $eq: ref } };
  const res = await http("GET", `/api/bios?${qs({ locale: loc, status: st, filters, populate: bioPopulate })}`);
  if (!res.data.length) die(`Bio "${ref}" not found (locale=${loc}, status=${st}).`);
  return res.data[0];
}
async function teamLists() {
  const page = (await http("GET", `/api/pages?${qs({ locale, status: "draft", filters: { documentId: { $eq: TEAM_PAGE } }, populate: pagePopulate })}`)).data[0];
  const tpl = await findTemplate("bio");
  return { page, tpl };
}
const biosBlock = (doc) => (doc?.sections || []).find((s) => s.__component === "sections.bios");

async function findPageSoft(documentId, loc, st) {
  const r = await http("GET", `/api/pages?${qs({ locale: loc, status: st, filters: { documentId: { $eq: documentId } }, fields: ["slug", "updatedAt", "publishedAt"] })}`).catch(() => ({ data: [] }));
  return r.data[0] || null;
}

const URL_PREFIX = {
  page: { ca: "", es: "", en: "" },
  article: { ca: "article/", es: "articulo/", en: "article/" },
  resource: { ca: "recurs/", es: "recurso/", en: "resource/" },
  scope: { ca: "ambit/", es: "ambito/", en: "scope/" },
  service: { ca: "servei/", es: "servicio/", en: "service/" },
  capability: { ca: "capabilitat/", es: "capabilidad/", en: "capability/" },
  project: { ca: "projecte/", es: "proyecto/", en: "project/" },
};
const SITE = process.env.RW_SITE_URL || (/w\.resilience\.earth/.test(API) ? "https://w.resilience.earth" : /localhost|127\.0\.0\.1/.test(API) ? "http://localhost:3000" : "https://resilience.earth");
const pagePublicUrl = (p, loc = locale) =>
  `${SITE}${loc === "ca" ? "" : "/" + loc}${p.slug === "home" ? "" : "/" + (URL_PREFIX[p.type]?.[loc] ?? "") + p.slug}`;

// translatable text leaves of a page payload, as { "json/pointer": "text" }
const TEXT_KEYS = new Set(["name", "slug", "title", "subTitle", "subtitle", "c2aText", "goToText", "author", "metaTitle", "metaDescription", "metaDescriptionShort"]);
function collectTexts(node, ptr = "", acc = {}, inC2a = false) {
  if (Array.isArray(node)) { node.forEach((v, i) => collectTexts(v, `${ptr}/${i}`, acc, inC2a)); return acc; }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      const here = `${ptr}/${k}`;
      if (typeof v === "string" && v.trim() && (TEXT_KEYS.has(k) || (k === "text" && (node.type === "text" || inC2a)))) acc[here] = v;
      else if (v && typeof v === "object") collectTexts(v, here, acc, k === "c2a" || k === "buttons");
    }
  }
  return acc;
}
function setPointer(obj, ptr, value) {
  const parts = ptr.split("/").slice(1);
  let o = obj;
  for (const p of parts.slice(0, -1)) o = o[p];
  o[parts.at(-1)] = value;
}

// ---------------------------------------------------------------------------
// convert a fetched document into a payload accepted by PUT/POST
// ---------------------------------------------------------------------------
const SYSTEM_KEYS = new Set([
  "id",
  "documentId",
  "createdAt",
  "updatedAt",
  "publishedAt",
  "locale",
  "localizations",
  "createdBy",
  "updatedBy",
]);

function isMedia(o) {
  return o && typeof o === "object" && "mime" in o && "url" in o && "hash" in o;
}
function isEntityRef(o) {
  return o && typeof o === "object" && typeof o.documentId === "string" && !("__component" in o);
}

/**
 * Strapi 5 REST rejects component ids: components are always re-created on
 * write, so ids are stripped. Media -> file id, relations -> {set:[documentId]}.
 */
function toWritable(value, { top = true } = {}) {
  if (Array.isArray(value)) {
    if (value.length && value.every(isMedia)) return value.map((m) => m.id);
    if (value.length && value.every(isEntityRef))
      // documents with draft & publish (e.g. Bio) can come back twice: deduplicate
      return { set: [...new Set(value.map((r) => r.documentId))].map((documentId) => ({ documentId })) };
    return value.map((v) => toWritable(v, { top: false }));
  }
  if (value && typeof value === "object") {
    if (isMedia(value)) return value.id;
    if (!top && isEntityRef(value)) return { set: [{ documentId: value.documentId }] };
    const res = {};
    for (const [k, v] of Object.entries(value)) {
      if (top && SYSTEM_KEYS.has(k)) continue;
      if (!top && k === "id") continue;
      if (!top && ["documentId", "createdAt", "updatedAt", "publishedAt", "locale"].includes(k)) continue;
      // Rich text ("blocks") is an array of nodes: keep untouched.
      res[k] = isBlocks(v) ? v : toWritable(v, { top: false });
    }
    return res;
  }
  return value;
}
function isBlocks(v) {
  return Array.isArray(v) && v.length > 0 && v.every((b) => b && typeof b === "object" && "type" in b && "children" in b);
}

// relations to null should be sent as {set: []}; empty media as null — Strapi
// accepts null for both, so nothing to do.

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function backup(kind, doc) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const f = path.join(BACKUP_DIR, `${stamp}_${kind}_${doc.documentId}_${doc.locale}.json`);
  fs.writeFileSync(f, JSON.stringify(doc, null, 2));
  console.error(`backup saved: ${f}`);
  return f;
}

const statusParam = () => (opt.publish ? "published" : "draft");

function adminUrl(kind, documentId, loc = locale) {
  return `${API}/admin/content-manager/collection-types/api::${kind}.${kind}/${documentId}?plugins[i18n][locale]=${loc}`;
}

// ---------------------------------------------------------------------------
// summaries
// ---------------------------------------------------------------------------
function plain(blocks) {
  if (!Array.isArray(blocks)) return "";
  const walk = (n) => (n.text ?? "") + (n.children || []).map(walk).join("");
  return blocks.map(walk).join(" / ");
}
function stylesSummary(s) {
  if (!s) return "";
  const keep = {};
  for (const [k, v] of Object.entries(s)) {
    if (k === "id" || v === null || v === "" || v === undefined) continue;
    keep[k] = isMedia(v) ? `[media ${v.name}]` : v;
  }
  return Object.keys(keep).length ? " styles=" + JSON.stringify(keep) : "";
}
function summarizeSections(sections) {
  const lines = [];
  (sections || []).forEach((s, i) => {
    const label = s.alias || s.title || s.subTitle || s.name || "";
    lines.push(`#${i} ${s.__component}${label ? ` "${label}"` : ""}${s.preset ? ` preset=${s.preset}` : ""}${stylesSummary(s.styles)}`);
    if (s.text) lines.push(`     text: ${plain(s.text).slice(0, 160)}`);
    if (s.menu) lines.push(`     menu: "${s.menu.title}" (${s.menu.documentId})`);
    if (s.template) lines.push(`     template: "${s.template.name}"`);
    if (Array.isArray(s.bios)) lines.push(`     bios: ${[...new Set(s.bios.map((b) => b.name))].join(", ") || "-"}`);
    for (const [j, c] of (s.columns || s.tabs || []).entries()) {
      lines.push(
        `     col${j}${c.title ? ` "${c.title}"` : ""}${stylesSummary(c.styles)}${c.media ? ` media=${c.media.name}` : ""}${c.c2a ? ` c2a="${c.c2a.text}"` : ""}${c.buttons?.length ? ` buttons=${c.buttons.map((b) => `"${b.text}"`).join(",")}` : ""}`
      );
      const t = plain(c.text);
      if (t) lines.push(`        ${t.slice(0, 160)}`);
    }
  });
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// commands
// ---------------------------------------------------------------------------
const commands = {
  async help() {
    out(`rw-content — resilience.earth content helper (API: ${API})

READ (no token needed)
  list [--type article|resource|page|scope|service|capability] [--locale ca] [--status draft|published]
  show <slug|documentId> [--locale ca] [--status draft|published]   human summary of a page
  get  <slug|documentId> [--locale ca] [--status draft]             full JSON of a page
  export <slug|documentId> --out file.json [--locale ca]           writable JSON ({"data":...})
  menus                                                            list menus (used by sliders, menus, scrollers)
  menu <title|documentId> [--locale ca]                            show the items of a menu
  template <name> [--locale ca]                                    show a template (global blocks)
  template-export <name> --out file.json [--locale ca]             writable JSON of a template (needs token)
  media <text>                                                     search the media library by file name

WRITE (needs RW_API_TOKEN; drafts by default; --yes required for non-local API)
  clone <slug|documentId> --name "New title" [--slug new-slug] [--locale ca]
        Copies a page (all blocks, styles, tags...) into a NEW draft page.
  push <file.json> --document <documentId> [--locale ca] [--publish]
        Replaces a page with the content of file.json (backup first).
  push <file.json> --new [--locale ca]                              creates a new page
  set <slug|documentId> <field> <value> [--locale ca] [--publish]  change one top-level field
  menu-add <menu> --page <slug|documentId> [--at N] [--title "label"] [--locale ca]
  menu-remove <menu> --index N [--locale ca]
  menu-move <menu> --from N --to M [--locale ca]
        (menus have no draft: these changes are LIVE immediately)
  publish <slug|documentId> [--locale ca]                          publish a page draft
  template-push <file.json> --name <template name> [--locale ca]  replace a template's blocks (LIVE on every page using it)
  texts <slug> --out t.json                                        translatable texts of a page ({"pointer": "text"})
  texts-apply <slug> t.json --locale es [--publish]                es/en version = ca structure + translated texts
  verify <slug> [--locale ca]                                      published? files OK? position in lists, menus containing it
  bios [--locale ca]                                               team members (+ who is in the team lists)
  bio-export <slug> --out f.json | bio-push f.json --new|--document <id> [--publish]
  team-add <bio slug> / team-remove <bio slug> [--locale ca]       "Qui som" page AND template "bio" (LIVE)
  taxonomies [--locale ca]                                         scopes, typologies, years, tags (documentIds)
  upload <file> [--alt "text"] [--replace <id>]                    (sets the file type from the extension)
  restore <backup.json>                                            put back a backup written by any write command

NOTES
  - The site shows published pages only: push drafts, review in the admin, then publish.
    (Deployments older than Oct 2026 rendered drafts: check before relying on this.)
  - Menus and templates have no draft/publish: every change is live.
  - Every update writes a backup JSON first (RW_BACKUP_DIR).

Env: RW_API_URL (default http://localhost:1337), RW_API_TOKEN, RW_BACKUP_DIR (default ./rw-backups)`);
  },

  async list() {
    const filters = opt.type ? { type: { $eq: opt.type } } : undefined;
    const q = qs({
      locale,
      status: opt.status || "published",
      filters,
      fields: ["name", "slug", "type", "sortDate", "updatedAt", "publishedAt"],
      sort: opt.type ? "sortDate:desc" : "type:asc",
      pagination: { pageSize: 100 },
    });
    const res = await http("GET", `/api/pages?${q}`);
    for (const p of res.data)
      console.log(`${p.documentId}  ${p.type.padEnd(10)} ${(p.sortDate || "").slice(0, 10)}  ${p.slug}  — ${p.name}`);
    console.log(`(${res.meta.pagination.total} pages, locale=${locale})`);
  },

  async show() {
    const p = await findPage(pos[0]);
    const pub = p.publishedAt ? p : await findPageSoft(p.documentId, p.locale, "published");
    const draft = p.publishedAt ? await findPageSoft(p.documentId, p.locale, "draft") : p;
    const pending = pub && draft && Date.parse(draft.updatedAt) > Date.parse(pub.updatedAt) + 2000;
    out(`${p.name}\n  documentId=${p.documentId} type=${p.type} slug=${p.slug} locale=${p.locale}`);
    out(`  published: ${pub ? `yes (${pub.publishedAt})` : "NO (only a draft: not visible on the site)"}${pending ? " — the draft has UNPUBLISHED changes" : ""}  [showing the ${p.publishedAt ? "published" : "draft"} version]`);
    out(`  metaTitle=${p.metadata?.metaTitle ?? "-"} | shareImage=${p.metadata?.shareImage?.name ?? "-"}`);
    out(`  metaDescription=${(p.metadata?.metaDescription ?? "-").slice(0, 160)}`);
    out(`  sortDate=${p.sortDate} author=${p.author ?? "-"} typology=${p.typology?.name ?? "-"} year=${p.year?.name ?? "-"} scopes=${(p.scopes || []).map((s) => s.name).join(", ") || "-"} tags=${(p.tags || []).map((s) => s.name).join(", ") || "-"}`);
    out(`  translations: ${(p.localizations || []).map((l) => `${l.locale}:${l.slug}`).join("  ") || "-"}`);
    out(`  admin: ${adminUrl("page", p.documentId, p.locale)}`);
    out("SECTIONS");
    out(summarizeSections(p.sections));
  },

  async get() {
    out(await findPage(pos[0]));
  },

  async export() {
    const p = await findPage(pos[0]);
    const data = toWritable(p);
    const json = JSON.stringify({ data }, null, 2);
    if (opt.out) {
      fs.writeFileSync(opt.out, json);
      console.error(`written ${opt.out} (documentId ${p.documentId}, locale ${p.locale})`);
    } else out(json);
  },

  async menus() {
    const q = qs({ locale, status: "published", fields: ["title"], sort: "title:asc", pagination: { pageSize: 200 } });
    const res = await http("GET", `/api/menus?${q}`);
    for (const m of res.data) console.log(`${m.documentId}  ${m.title}`);
  },

  async menu() {
    const m = await findMenu(pos[0]);
    out(`${m.title} (${m.documentId}) locale=${m.locale} status=${m.publishedAt ? "published" : "draft"}`);
    (m.children || []).forEach((c, i) =>
      out(`  [${i}] ${c.page ? `page:${c.page.slug} (${c.page.type})` : ""}${c.title ? ` title="${c.title}"` : ""}${c.href ? ` href=${c.href}` : ""}${c.image ? ` image=${c.image.name}` : ""}${c.submenu ? ` submenu="${c.submenu.title}"` : ""}`)
    );
    out(`  admin: ${adminUrl("menu", m.documentId, m.locale)}`);
  },

  async template() {
    const q = qs({ locale, status, filters: { name: { $eq: pos[0] } }, populate: templatePopulate });
    const res = await http("GET", `/api/templates?${q}`, null, { auth: true }).catch(async () => {
      // public role cannot list templates: fall back to the custom route
      return { data: [await http("GET", `/api/pages/templates/${encodeURIComponent(pos[0])}?locale=${locale}`)] };
    });
    const t = res.data[0];
    if (!t) die("template not found");
    out(`template "${t.name}" (${t.documentId})`);
    out(summarizeSections(t.sections));
  },

  async "template-export"() {
    const t = await findTemplate(pos[0]);
    const json = JSON.stringify({ data: toWritable(t) }, null, 2);
    if (opt.out) {
      fs.writeFileSync(opt.out, json);
      console.error(`written ${opt.out} (template ${t.name}, ${t.documentId}, locale ${t.locale})`);
    } else out(json);
  },

  async "template-push"() {
    assertWritable();
    if (!opt.name) die("--name <template name> is required");
    const body = JSON.parse(fs.readFileSync(pos[0], "utf8"));
    const data = body.data ?? body;
    const t = await findTemplate(opt.name);
    backup("template", t);
    await http("PUT", `/api/templates/${t.documentId}?locale=${locale}`, { data });
    out(`template "${t.name}" (${locale}) updated — live on every page that uses it`);
  },

  async media() {
    const q = qs({ filters: { name: { $containsi: pos[0] || "" } }, sort: "createdAt:desc", pagination: { pageSize: 30 } });
    const res = await http("GET", `/api/upload/files?${q}`, null, { auth: true });
    for (const f of res) console.log(`${String(f.id).padStart(6)}  ${f.mime.padEnd(16)} ${f.width ?? ""}x${f.height ?? ""}  ${f.name}  ${API}${f.url}`);
  },

  async clone() {
    assertWritable();
    if (!opt.name) die('--name "New title" is required');
    const src = await findPage(pos[0]);
    const data = toWritable(src);
    data.name = opt.name;
    data.slug = opt.slug || slugify(opt.name);
    data.sortDate = new Date().toISOString();
    if (data.metadata) {
      data.metadata.metaTitle = opt.name;
    }
    const res = await http("POST", `/api/pages?locale=${locale}&status=draft`, { data });
    const d = res.data;
    out(`created DRAFT page "${d.name}" documentId=${d.documentId} slug=${d.slug} locale=${d.locale}`);
    out(`copied from: ${src.slug}. Now change texts/images, then publish.`);
    out(`REVIEW (copied from the original): metadata (description, shareImage), author, typology, year, scopes, tags, audio, every block's texts and images.`);
    out(`admin: ${adminUrl("page", d.documentId, d.locale)}`);
  },

  async push() {
    assertWritable();
    const file = pos[0];
    const body = JSON.parse(fs.readFileSync(file, "utf8"));
    const data = body.data ?? body;
    if (opt.new) {
      const res = await http("POST", `/api/pages?locale=${locale}&status=${statusParam()}`, { data });
      out(`created page documentId=${res.data.documentId} slug=${res.data.slug} (${statusParam()})`);
      out(`admin: ${adminUrl("page", res.data.documentId)}`);
      return;
    }
    if (!opt.document) die("--document <documentId> (or --new) is required");
    const q = qs({ locale, status: "draft", filters: { documentId: { $eq: opt.document } }, populate: pagePopulate });
    const current = (await http("GET", `/api/pages?${q}`)).data[0];
    if (current) backup("page", current);
    else console.error(`no "${locale}" version yet: creating the ${locale} translation of ${opt.document}`);
    const res = await http("PUT", `/api/pages/${opt.document}?locale=${locale}&status=${statusParam()}`, { data });
    out(`updated page ${res.data.documentId} (${locale}) -> ${statusParam()}`);
    out(`admin: ${adminUrl("page", res.data.documentId)}`);
  },

  async set() {
    assertWritable();
    const [ref, field, ...rest] = pos;
    if (!field) die("usage: set <page> <field> <value>");
    let value = rest.join(" ");
    try {
      value = JSON.parse(value);
    } catch {}
    const current = await findPage(ref, { st: "draft" });
    backup("page", current);
    const res = await http("PUT", `/api/pages/${current.documentId}?locale=${locale}&status=${statusParam()}`, {
      data: { [field]: value },
    });
    out(`page ${res.data.documentId}: ${field} updated (${statusParam()})`);
  },

  async "menu-add"() {
    assertWritable();
    if (!opt.page) die("--page <slug|documentId> is required");
    const m = await findMenu(pos[0], { st: "draft" });
    backup("menu", m);
    const page = await findPage(opt.page, { st: "draft", type: opt.type });
    const children = toWritable(m.children || [], { top: false });
    const item = { page: { set: [{ documentId: page.documentId }] } };
    // The title labels the row in the admin; sliders don't display it.
    item.title = typeof opt.title === "string" ? opt.title : page.name;
    const at = opt.at === undefined ? 0 : Number(opt.at);
    children.splice(at, 0, item);
    await http("PUT", `/api/menus/${m.documentId}?locale=${locale}`, { data: { children } });
    out(`added "${page.name}" to menu "${m.title}" at position ${at} — LIVE (menus have no draft)`);
    await printMenu(m.documentId);
  },

  async "menu-remove"() {
    assertWritable();
    const m = await findMenu(pos[0], { st: "draft" });
    backup("menu", m);
    const children = toWritable(m.children || [], { top: false });
    const [removed] = children.splice(Number(opt.index), 1);
    if (!removed) die("no item at that index");
    await http("PUT", `/api/menus/${m.documentId}?locale=${locale}`, { data: { children } });
    out(`removed item ${opt.index} from "${m.title}" — LIVE (menus have no draft)`);
    await printMenu(m.documentId);
  },

  async "menu-move"() {
    assertWritable();
    const m = await findMenu(pos[0], { st: "draft" });
    backup("menu", m);
    const children = toWritable(m.children || [], { top: false });
    const [it] = children.splice(Number(opt.from), 1);
    if (!it) die("no item at --from");
    children.splice(Number(opt.to), 0, it);
    await http("PUT", `/api/menus/${m.documentId}?locale=${locale}`, { data: { children } });
    out(`moved item ${opt.from} -> ${opt.to} in "${m.title}" — LIVE (menus have no draft)`);
    await printMenu(m.documentId);
  },

  async texts() {
    const p = await findPage(pos[0]);
    const json = JSON.stringify(collectTexts(toWritable(p)), null, 2);
    if (opt.out) { fs.writeFileSync(opt.out, json); console.error(`written ${opt.out}: translate the values, keep the keys (${p.locale} → target locale)`); }
    else out(json);
  },

  async "texts-apply"() {
    // builds the target-locale version from the SOURCE locale structure (default ca) + translated texts
    assertWritable();
    const [ref, file] = pos;
    if (!file) die("usage: texts-apply <slug|documentId> <translated.json> --locale es [--from ca] [--publish]");
    const from = opt.from || "ca";
    if (locale === from) die("--locale must be the TARGET language (es / en)");
    const src = await findPage(ref, { loc: from });
    const data = toWritable(src);
    const tr = JSON.parse(fs.readFileSync(file, "utf8"));
    const keys = Object.keys(collectTexts(data));
    const missing = keys.filter((k) => !(k in tr));
    for (const [k, v] of Object.entries(tr)) setPointer({ data }, "/data" + k, v);
    if (missing.length) console.error(`WARNING: ${missing.length} text(s) not translated, kept from ${from}: ${missing.slice(0, 5).join(" ")}`);
    const cur = await findPageSoft(src.documentId, locale, "draft");
    if (cur) backup("page", await findPage(src.documentId, { loc: locale, st: "draft" }));
    const res = await http("PUT", `/api/pages/${src.documentId}?locale=${locale}&status=${statusParam()}`, { data });
    out(`${cur ? "updated" : "created"} ${locale} version of ${src.documentId}: ${res.data.slug} (${statusParam()}) — ${pagePublicUrl(res.data, locale)}`);
    out(`CHECK: images were copied from ${from}; replace any image that contains ${from} text.`);
  },

  async verify() {
    const p = await findPage(pos[0], { st: "published" }).catch(() => null);
    if (!p) die(`"${pos[0]}" has no PUBLISHED ${locale} version: it is not visible on the site.`);
    out(`${p.name} — published ${p.publishedAt}\n  ${pagePublicUrl(p)}`);
    const live = await http("GET", `/api/pages/sections/${p.documentId}?locale=${locale}`).catch((e) => die("sections endpoint failed: " + e.message));
    // images and files actually used by the live page
    const media = [];
    const walk = (o, where) => {
      if (Array.isArray(o)) return o.forEach((v, i) => walk(v, `${where}[${i}]`));
      if (o && typeof o === "object") {
        if (isMedia(o)) return media.push({ where, name: o.name, url: o.url, mime: o.mime });
        for (const [k, v] of Object.entries(o)) if (!["page", "menu", "bios", "capabilities", "localizations"].includes(k)) walk(v, `${where}.${k}`);
      }
    };
    walk(live.metadata, "metadata"); walk(live.sections, "sections");
    let bad = 0;
    for (const m of media) {
      const r = await fetch(m.url.startsWith("http") ? m.url : API + m.url, { method: "HEAD" }).catch(() => null);
      const ok = r && r.ok && m.mime !== "application/octet-stream";
      if (!ok) bad++;
      out(`  ${ok ? "ok " : "BAD"} ${m.mime.padEnd(16)} ${m.name}  (${m.where})${r ? "" : " unreachable"}${r && !r.ok ? " HTTP " + r.status : ""}`);
    }
    out(`  ${media.length} file(s), ${bad} problem(s)${locale !== "ca" ? " — images shared with ca may contain Catalan text: look at them" : ""}`);
    // position in the automatic lists
    if (["article", "resource"].includes(p.type)) {
      const lst = await http("GET", `/api/pages?${qs({ locale, filters: { type: { $eq: p.type } }, sort: ["sortDate:desc", "createdAt:desc"], fields: ["slug"], pagination: { pageSize: 100 } })}`);
      const pos1 = lst.data.findIndex((x) => x.documentId === p.documentId) + 1;
      out(`  position in ${p.type === "article" ? "Caos Creatiu / Home mosaic" : "Eines disruptives list"}: ${pos1 || "NOT FOUND"} of ${lst.data.length}`);
    }
    // menus (sliders, navigation) that contain it
    if (TOKEN) {
      const ms = await http("GET", `/api/menus?${qs({ locale, populate: { children: { populate: { page: { fields: ["slug"] } } } }, pagination: { pageSize: 200 } })}`);
      const inMenus = ms.data.flatMap((m) => (m.children || []).map((c, i) => (c.page?.documentId === p.documentId ? `"${m.title}" [${i}]` : null)).filter(Boolean));
      out(`  in menus/sliders: ${inMenus.join(", ") || "none"}`);
    }
  },

  async bios() {
    const q = qs({ locale, status: opt.status || "published", fields: ["name", "slug", "position", "weight"], sort: "weight:asc", pagination: { pageSize: 200 } });
    const res = await http("GET", `/api/bios?${q}`);
    for (const b of res.data) console.log(`${b.documentId}  w=${String(b.weight ?? "-").padEnd(4)} ${b.slug}  — ${b.name} (${b.position ?? ""})`);
    const { page, tpl } = await teamLists();
    const names = (blk) => [...new Set((blk?.bios || []).map((b) => b.slug))].join(", ");
    out(`\nteam on page "${page?.slug}": ${names(biosBlock(page))}`);
    out(`team on template "bio":   ${names(biosBlock(tpl))}`);
  },

  async "bio-export"() {
    const b = await findBio(pos[0]);
    const json = JSON.stringify({ data: toWritable(b) }, null, 2);
    if (opt.out) { fs.writeFileSync(opt.out, json); console.error(`written ${opt.out} (bio ${b.documentId}, ${b.locale})`); }
    else out(json);
  },

  async "bio-push"() {
    assertWritable();
    const body = JSON.parse(fs.readFileSync(pos[0], "utf8"));
    const data = body.data ?? body;
    if (opt.new) {
      const res = await http("POST", `/api/bios?locale=${locale}&status=${statusParam()}`, { data });
      out(`created bio ${res.data.documentId} slug=${res.data.slug} (${statusParam()}) — /bio/${res.data.slug}`);
      return;
    }
    if (!opt.document) die("--document <documentId> (or --new) is required");
    try { backup("bio", await findBio(opt.document, { st: "draft" })); } catch {}
    const res = await http("PUT", `/api/bios/${opt.document}?locale=${locale}&status=${statusParam()}`, { data });
    out(`updated bio ${res.data.documentId} (${locale}) -> ${statusParam()}`);
  },

  async "team-add"() { await commands._team(true); },
  async "team-remove"() { await commands._team(false); },
  async _team(add) {
    assertWritable();
    const bio = await findBio(pos[0], { st: "published" }).catch(() => die(`bio "${pos[0]}" is not published in ${locale}: publish it first`));
    const { page, tpl } = await teamLists();
    for (const [kind, doc] of [["page", page], ["template", tpl]]) {
      const data = toWritable(doc);
      const blk = biosBlock(data);
      if (!blk) die(`no Bios block in ${kind}`);
      let ids = (blk.bios?.set || []).map((r) => r.documentId);
      const had = ids.includes(bio.documentId);
      ids = ids.filter((i) => i !== bio.documentId);
      if (add) ids.push(bio.documentId); // display order comes from each Bio's weight
      blk.bios = { set: ids.map((documentId) => ({ documentId })) };
      if (had === add) { out(`${kind}: already ${add ? "there" : "absent"}`); continue; }
      backup(kind, doc);
      if (kind === "page") {
        delete data.sortDate;
        await http("PUT", `/api/pages/${doc.documentId}?locale=${locale}&status=published`, { data });
      } else await http("PUT", `/api/templates/${doc.documentId}?locale=${locale}`, { data });
      out(`${kind} ${kind === "page" ? doc.slug : "bio"}: ${add ? "added" : "removed"} ${bio.name} (${locale}) — LIVE`);
    }
  },

  async taxonomies() {
    for (const [api, label] of [["scopes", "scopes (àmbits)"], ["typologies", "typology"], ["years", "year"], ["tags", "tags"]]) {
      const q = qs({ locale, fields: ["name"], sort: "name:asc", pagination: { pageSize: 200 } });
      const res = await http("GET", `/api/${api}?${q}`).catch(() => ({ data: [] }));
      out(`${label}: ` + (res.data.map((t) => `${t.name} [${t.documentId}]`).join(" · ") || (TOKEN ? "(none)" : "(empty: set RW_API_TOKEN)")));
    }
  },

  async publish() {
    assertWritable();
    const kind = "page";
    const doc = await findPage(pos[0], { st: "draft" });
    // Re-saving the draft with status=published publishes it.
    await http("PUT", `/api/${kind}s/${doc.documentId}?locale=${locale}&status=published`, { data: {} });
    out(`published ${kind} ${doc.documentId} (${locale})`);
  },

  async restore() {
    assertWritable();
    const file = pos[0];
    const doc = JSON.parse(fs.readFileSync(file, "utf8"));
    const kind = path.basename(file).split("_")[1]; // <stamp>_<kind>_<documentId>_<locale>.json
    if (!["page", "menu", "template", "bio"].includes(kind) || !doc.documentId || !doc.locale)
      die("not a rw-content backup file");
    const data = toWritable(doc);
    const st = kind === "page" ? (opt.publish ? "&status=published" : "&status=draft") : "";
    await http("PUT", `/api/${kind}s/${doc.documentId}?locale=${doc.locale}${st}`, { data });
    out(`restored ${kind} ${doc.documentId} (${doc.locale}) from ${file}`);
  },

  async upload() {
    assertWritable();
    const file = pos[0];
    if (!file || !fs.existsSync(file)) die("file not found");
    const form = new FormData();
    // without an explicit type Strapi stores application/octet-stream and the site doesn't show the image
    form.append("files", new Blob([fs.readFileSync(file)], { type: mimeOf(file) }), path.basename(file));
    if (opt.alt) form.append("fileInfo", JSON.stringify({ alternativeText: opt.alt, name: path.basename(file) }));
    const target = opt.replace ? `${API}/api/upload?id=${opt.replace}` : `${API}/api/upload`;
    const res = await fetch(target, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: form,
    });
    const json = await res.json();
    if (!res.ok) die(JSON.stringify(json));
    for (const f of [].concat(json)) {
      out(`${opt.replace ? "replaced" : "uploaded"} id=${f.id} ${f.mime} ${f.width ?? "-"}x${f.height ?? "-"} ${f.name} ${API}${f.url}`);
      if (f.mime === "application/octet-stream") console.error("WARNING: stored as octet-stream: the site will not show it as an image");
    }
  },
};

if (!cmd || !commands[cmd]) {
  await commands.help();
  process.exit(cmd ? 1 : 0);
}
try {
  await commands[cmd]();
} catch (e) {
  die(e.message);
}

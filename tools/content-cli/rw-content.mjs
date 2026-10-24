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
  if (!res.data.length) die(`Menu "${ref}" not found (locale=${loc}).`);
  return res.data[0];
}

async function findTemplate(name, { loc = locale } = {}) {
  if (!TOKEN) die("reading templates in full needs RW_API_TOKEN (the public role cannot list templates)");
  const q = qs({ locale: loc, filters: { name: { $eq: name } }, populate: templatePopulate });
  const res = await http("GET", `/api/templates?${q}`);
  if (!res.data.length) die(`Template "${name}" not found (locale=${loc}).`);
  return res.data[0];
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
      return { set: value.map((r) => ({ documentId: r.documentId })) };
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
    for (const [j, c] of (s.columns || s.tabs || []).entries()) {
      lines.push(
        `     col${j}${c.title ? ` "${c.title}"` : ""}${stylesSummary(c.styles)}${c.media ? ` media=${c.media.name}` : ""}${c.c2a ? ` c2a="${c.c2a.text}"` : ""}`
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
  restore <backup.json>                                            put back a backup written by any write command
  upload <file> [--alt "text"]                                     upload an image/file, prints its id

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
    out(`${p.name}\n  documentId=${p.documentId} type=${p.type} slug=${p.slug} locale=${p.locale} status=${p.publishedAt ? "published" : "draft"}`);
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
    await http("PUT", `/api/menus/${m.documentId}?locale=${locale}&status=${statusParam()}`, { data: { children } });
    out(`added "${page.name}" to menu "${m.title}" at position ${at} (${statusParam()})`);
    await commands.menu();
  },

  async "menu-remove"() {
    assertWritable();
    const m = await findMenu(pos[0], { st: "draft" });
    backup("menu", m);
    const children = toWritable(m.children || [], { top: false });
    const [removed] = children.splice(Number(opt.index), 1);
    if (!removed) die("no item at that index");
    await http("PUT", `/api/menus/${m.documentId}?locale=${locale}&status=${statusParam()}`, { data: { children } });
    out(`removed item ${opt.index} from "${m.title}" (${statusParam()})`);
    await commands.menu();
  },

  async "menu-move"() {
    assertWritable();
    const m = await findMenu(pos[0], { st: "draft" });
    backup("menu", m);
    const children = toWritable(m.children || [], { top: false });
    const [it] = children.splice(Number(opt.from), 1);
    if (!it) die("no item at --from");
    children.splice(Number(opt.to), 0, it);
    await http("PUT", `/api/menus/${m.documentId}?locale=${locale}&status=${statusParam()}`, { data: { children } });
    out(`moved item ${opt.from} -> ${opt.to} in "${m.title}" (${statusParam()})`);
    await commands.menu();
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
    if (!["page", "menu", "template"].includes(kind) || !doc.documentId || !doc.locale)
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
    form.append("files", new Blob([fs.readFileSync(file)]), path.basename(file));
    if (opt.alt) form.append("fileInfo", JSON.stringify({ alternativeText: opt.alt, name: path.basename(file) }));
    const res = await fetch(`${API}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: form,
    });
    const json = await res.json();
    if (!res.ok) die(JSON.stringify(json));
    for (const f of json) out(`uploaded id=${f.id} ${f.name} ${API}${f.url}`);
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

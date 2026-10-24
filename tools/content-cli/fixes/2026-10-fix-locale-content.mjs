#!/usr/bin/env node
/**
 * One-off content fix (October 2026). See docs/tasks/002-contingut-es-en-trencat.md
 *
 * 1. Templates (es/en): sliders/menus that have no menu linked get the same
 *    menu as the Catalan version (menus share documentId across locales).
 * 2. Templates and pages (es/en): CSS classes that were machine-translated
 *    are restored (e.g. "naranja-títulos" -> "orange-titles").
 *
 * Pages are written as DRAFT only (that's the version the site renders), so
 * unpublished differences of the published version are not touched.
 *
 * Usage:
 *   RW_API_URL=... RW_API_TOKEN=... node 2026-10-fix-locale-content.mjs          # dry run
 *   RW_API_URL=... RW_API_TOKEN=... node 2026-10-fix-locale-content.mjs --apply  # write
 * Backups of every touched document are written to ./rw-backups/ before writing.
 */
import fs from "node:fs";
import path from "node:path";

const API = (process.env.RW_API_URL || "http://localhost:1337").replace(/\/$/, "");
const TOKEN = process.env.RW_API_TOKEN;
const APPLY = process.argv.includes("--apply");
const BACKUP_DIR = path.resolve(process.env.RW_BACKUP_DIR || "rw-backups");
if (!TOKEN) throw new Error("RW_API_TOKEN required");

const CLASS_FIX = {
  "slider-tres-negro": "slider-three-black",
  "slider-tres-negro-kaos": "slider-three-black-kaos",
  "naranja-títulos": "orange-titles",
  "artículo-details": "article-details",
  "ancho-table-leaf": "width-container-full",
  "width-table-leaf": "width-container-full",
};
// multi-word translations
const PHRASE_FIX = [["medios de comunicación-fronterizo", "media-border-radius"]];

const TEMPLATES = ["article", "resource", "scope", "service", "capability", "article-information", "resource-information"];
const PAGES = [
  { slugCa: "home", type: "page" },
  { slugCa: "els-patrons-internacionals-de-la-resiliencia-territorial", type: "resource" },
  { slugCa: "futurs-impossibles", type: "resource" },
];

// ---------------------------------------------------------------- helpers
function qs(obj, prefix = "") {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      const key = prefix ? `${prefix}[${k}]` : k;
      return typeof v === "object" ? qs(v, key) : `${encodeURIComponent(key).replace(/%5B/g, "[").replace(/%5D/g, "]")}=${encodeURIComponent(v)}`;
    })
    .join("&");
}
async function http(method, url, body) {
  const res = await fetch(API + url, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await res.text();
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status} ${t}`);
  return t ? JSON.parse(t) : null;
}
const stylesPop = { populate: "*" };
const colPop = { populate: { media: true, styles: stylesPop, c2a: { populate: { page: { fields: ["slug"] } } }, verticalScroller: { fields: ["title"] } } };
const on = {
  "sections.hero": { populate: { styles: stylesPop } },
  "sections.columns": { populate: { styles: stylesPop, columns: colPop } },
  "sections.tabs": { populate: { styles: stylesPop, tabs: colPop } },
  "sections.blog": { populate: { styles: stylesPop, blogPage: { populate: { page: { fields: ["slug"] } } }, noResultsImage: true } },
  "sections.masonry": { populate: { styles: stylesPop, pages: { populate: { page: { fields: ["slug"] } } }, noResultsImage: true } },
  "sections.menu": { populate: { styles: stylesPop, menu: true } },
  "sections.slider": { populate: { styles: stylesPop, c2a: { populate: { page: { fields: ["slug"] } } }, menu: true } },
  "sections.scroller": { populate: { styles: stylesPop, menu: true } },
  "sections.blurbs": { populate: { styles: stylesPop, blurbs: { populate: { image: true } } } },
  "sections.bios": { populate: { styles: stylesPop, bios: true } },
  "sections.capabilities": { populate: { styles: stylesPop, capabilities: true } },
  "sections.timeline": { populate: { styles: stylesPop } },
  "sections.template": { populate: { template: true } },
  "sections.video": { populate: { image: true, styles: stylesPop } },
  "sections.ecosystem": { populate: { styles: stylesPop } },
  "sections.lead-form": { populate: { styles: stylesPop } },
  "sections.modal": { populate: { image: true, imageTablet: true, imageMobile: true } },
};
const isMedia = (o) => o && typeof o === "object" && "mime" in o && "hash" in o;
const isRef = (o) => o && typeof o === "object" && typeof o.documentId === "string" && !("__component" in o);
const isBlocks = (v) => Array.isArray(v) && v.length && v.every((b) => b && typeof b === "object" && "type" in b && "children" in b);
function writable(v, top = true) {
  if (Array.isArray(v)) {
    if (v.length && v.every(isMedia)) return v.map((m) => m.id);
    if (v.length && v.every(isRef)) return { set: v.map((r) => ({ documentId: r.documentId })) };
    return v.map((x) => writable(x, false));
  }
  if (v && typeof v === "object") {
    if (isMedia(v)) return v.id;
    if (!top && isRef(v)) return { set: [{ documentId: v.documentId }] };
    const o = {};
    for (const [k, x] of Object.entries(v)) {
      if (["id", "documentId", "createdAt", "updatedAt", "publishedAt", "locale", "localizations", "createdBy", "updatedBy"].includes(k)) continue;
      o[k] = isBlocks(x) ? x : writable(x, false);
    }
    return o;
  }
  return v;
}
function fixClasses(cls) {
  if (!cls) return cls;
  let s = cls;
  for (const [a, b] of PHRASE_FIX) s = s.split(a).join(b);
  return s
    .split(/\s+/)
    .map((t) => CLASS_FIX[t] ?? t)
    .join(" ");
}
/** walks sections, fixing cssClass values; returns list of changes */
function fixSectionClasses(sections, changes, where) {
  sections.forEach((s, i) => {
    const visit = (styles, label) => {
      if (!styles?.cssClass) return;
      const f = fixClasses(styles.cssClass);
      if (f !== styles.cssClass) {
        changes.push(`${where} #${i + 1} ${label}: "${styles.cssClass}" -> "${f}"`);
        styles.cssClass = f;
      }
    };
    visit(s.styles, s.__component);
    (s.columns || s.tabs || []).forEach((c, j) => visit(c.styles, `column ${j + 1}`));
  });
}
function backup(kind, doc) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const f = path.join(BACKUP_DIR, `${new Date().toISOString().replace(/[:.]/g, "-")}_${kind}_${doc.documentId}_${doc.locale}.json`);
  fs.writeFileSync(f, JSON.stringify(doc, null, 2));
  return f;
}

// ---------------------------------------------------------------- main
const getTemplate = async (name, locale) =>
  (await http("GET", `/api/templates?${qs({ locale, filters: { name: { $eq: name } }, populate: { sections: { on } } })}`)).data[0];

let total = 0;
for (const name of TEMPLATES) {
  const ca = await getTemplate(name, "ca");
  if (!ca) continue;
  for (const locale of ["es", "en"]) {
    const t = await getTemplate(name, locale);
    if (!t) continue;
    const changes = [];
    t.sections.forEach((s, i) => {
      const ref = ca.sections[i];
      if (["sections.slider", "sections.menu", "sections.scroller"].includes(s.__component) && !s.menu && ref?.__component === s.__component && ref.menu) {
        s.menu = { documentId: ref.menu.documentId };
        changes.push(`template ${name}/${locale} #${i + 1} ${s.__component}: link menu "${ref.menu.title}" (${ref.menu.documentId})`);
      }
    });
    fixSectionClasses(t.sections, changes, `template ${name}/${locale}`);
    if (!changes.length) continue;
    total += changes.length;
    changes.forEach((c) => console.log((APPLY ? "FIX  " : "WOULD FIX  ") + c));
    if (APPLY) {
      console.log("     backup:", backup("template", t));
      await http("PUT", `/api/templates/${t.documentId}?locale=${locale}`, { data: { sections: writable(t.sections, false) } });
    }
  }
}

for (const { slugCa, type } of PAGES) {
  const caRes = await http("GET", `/api/pages?${qs({ locale: "ca", status: "draft", filters: { slug: { $eq: slugCa }, type: { $eq: type } }, fields: ["slug"] })}`);
  const docId = caRes.data[0]?.documentId;
  if (!docId) continue;
  for (const locale of ["es", "en"]) {
    const res = await http("GET", `/api/pages?${qs({ locale, status: "draft", filters: { documentId: { $eq: docId } }, populate: { sections: { on } } })}`);
    const p = res.data[0];
    if (!p) continue;
    const changes = [];
    fixSectionClasses(p.sections, changes, `page ${p.slug}/${locale}`);
    if (!changes.length) continue;
    total += changes.length;
    changes.forEach((c) => console.log((APPLY ? "FIX  " : "WOULD FIX  ") + c));
    if (APPLY) {
      console.log("     backup:", backup("page", p));
      await http("PUT", `/api/pages/${docId}?locale=${locale}&status=draft`, { data: { sections: writable(p.sections, false) } });
    }
  }
}
console.log(total ? `${total} change(s) ${APPLY ? "applied" : "pending (dry run; use --apply)"}` : "nothing to fix");

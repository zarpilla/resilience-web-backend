#!/usr/bin/env node
/**
 * One-off: bring es/en pages up to date with the current Catalan (October 2026).
 * See docs/tasks/007-traduccions-desactualitzades.md
 *
 * payloads/<documentId>.<locale>.json      corrected es/en versions (built from the Catalan structure)
 * payloads/tpl-complexitat.<locale>.json   template "template-complexitat" (button label)
 * snapshots/<documentId>.<locale>.json     what ca/es/en looked like when the payloads were made
 *
 * Safety: before writing a page, the current ca (and es/en, if it exists) are compared with the
 * snapshots. If anyone edited them since, the page is SKIPPED (re-run the audit for it).
 * Every write is preceded by a backup in ./rw-backups/.
 *
 *   RW_API_URL=... RW_API_TOKEN=... node apply.mjs            # dry run
 *   RW_API_URL=... RW_API_TOKEN=... node apply.mjs --apply    # write + publish
 *   ... node apply.mjs --apply --only <documentId>[,<id>...]  # subset
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const API = (process.env.RW_API_URL || "http://localhost:1337").replace(/\/$/, "");
const TOKEN = process.env.RW_API_TOKEN;
const APPLY = process.argv.includes("--apply");
const onlyArg = process.argv[process.argv.indexOf("--only") + 1];
const ONLY = process.argv.includes("--only") ? new Set(onlyArg.split(",")) : null;
const BACKUP_DIR = path.resolve(process.env.RW_BACKUP_DIR || "rw-backups");
if (!TOKEN) throw new Error("RW_API_TOKEN required");

// ---------------------------------------------------------------- helpers (same as rw-content)
function qs(obj, prefix = "") {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      const key = prefix ? `${prefix}[${k}]` : k;
      return typeof v === "object"
        ? qs(v, key)
        : `${encodeURIComponent(key).replace(/%5B/g, "[").replace(/%5D/g, "]")}=${encodeURIComponent(v)}`;
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
  if (!res.ok) throw new Error(`${method} ${url.slice(0, 120)} -> ${res.status} ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : null;
}
const stylesPop = { populate: "*" };
const colPop = { populate: { media: true, styles: stylesPop, c2a: { populate: { page: true } }, verticalScroller: true } };
const on = {
  "sections.hero": { populate: { styles: stylesPop } },
  "sections.columns": { populate: { styles: stylesPop, columns: colPop } },
  "sections.tabs": { populate: { styles: stylesPop, tabs: colPop } },
  "sections.blog": { populate: { styles: stylesPop, blogPage: { populate: { page: true } }, noResultsImage: true } },
  "sections.masonry": { populate: { styles: stylesPop, pages: { populate: { page: true } }, noResultsImage: true } },
  "sections.menu": { populate: { styles: stylesPop, menu: true } },
  "sections.slider": { populate: { styles: stylesPop, c2a: { populate: { page: true } }, menu: true } },
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
const pagePopulate = {
  metadata: { populate: { shareImage: true } },
  sections: { on },
  tags: true,
  scopes: true,
  typology: true,
  year: true,
  audio: true,
};
const isMedia = (o) => o && typeof o === "object" && "mime" in o && "hash" in o;
const isRef = (o) => o && typeof o === "object" && typeof o.documentId === "string" && !("__component" in o);
const isBlocks = (v) => Array.isArray(v) && v.length && v.every((b) => b && typeof b === "object" && "type" in b && "children" in b);
const SYS = ["id", "documentId", "createdAt", "updatedAt", "publishedAt", "locale", "localizations", "createdBy", "updatedBy"];
function writable(v, top = true) {
  if (Array.isArray(v)) {
    if (v.length && v.every(isMedia)) return v.map((m) => m.id);
    if (v.length && v.every(isRef))
      return { set: [...new Set(v.map((r) => r.documentId))].map((documentId) => ({ documentId })) };
    return v.map((x) => writable(x, false));
  }
  if (v && typeof v === "object") {
    if (isMedia(v)) return v.id;
    if (!top && isRef(v)) return { set: [{ documentId: v.documentId }] };
    const o = {};
    for (const [k, x] of Object.entries(v)) {
      if (top ? SYS.includes(k) : ["id", "documentId", "createdAt", "updatedAt", "publishedAt", "locale"].includes(k)) continue;
      o[k] = isBlocks(x) ? x : writable(x, false);
    }
    return o;
  }
  return v;
}
// order-insensitive comparison of relation sets
const canon = (v) =>
  JSON.stringify(v, (k, x) =>
    x && typeof x === "object" && Array.isArray(x.set)
      ? x.set.length
        ? { set: [...new Set(x.set.map((s) => s.documentId))].sort() }
        : null // an empty relation reads back as null
      : x
  );

async function current(kind, id, locale) {
  if (kind === "template") {
    const r = await http("GET", `/api/templates?${qs({ locale, filters: { name: { $eq: id } }, populate: { sections: { on } } })}`);
    return r.data[0] || null;
  }
  const r = await http("GET", `/api/pages?${qs({ locale, status: "draft", filters: { documentId: { $eq: id } }, populate: pagePopulate })}`);
  return r.data[0] || null;
}
function backup(kind, doc) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const f = path.join(BACKUP_DIR, `${new Date().toISOString().replace(/[:.]/g, "-")}_${kind}_${doc.documentId}_${doc.locale}.json`);
  fs.writeFileSync(f, JSON.stringify(doc, null, 2));
  return f;
}
// Localized relations (bios, capabilities, tags, scopes...) can only point to documents that
// exist in the target locale: drop the others instead of failing with a 404.
const REL_API = { bios: "bios", capabilities: "capabilities", tags: "tags", scopes: "scopes", typology: "typologies", menu: "menus", verticalScroller: "menus", submenu: "menus", page: "pages", template: "templates" };
const existsCache = new Map();
async function existsIn(api, documentId, locale) {
  const k = `${api}:${documentId}:${locale}`;
  if (!existsCache.has(k)) {
    const r = await http("GET", `/api/${api}?${qs({ locale, status: "draft", filters: { documentId: { $eq: documentId } }, fields: ["id"] })}`).catch(() => ({ data: [] }));
    existsCache.set(k, r.data.length > 0);
  }
  return existsCache.get(k);
}
async function pruneRelations(v, locale, dropped) {
  if (Array.isArray(v)) { for (const x of v) await pruneRelations(x, locale, dropped); return; }
  if (!v || typeof v !== "object") return;
  for (const [k, x] of Object.entries(v)) {
    if (REL_API[k] && x && Array.isArray(x.set)) {
      const keep = [];
      for (const r of x.set) (await existsIn(REL_API[k], r.documentId, locale)) ? keep.push(r) : dropped.push(`${k}:${r.documentId}`);
      x.set = keep;
    } else await pruneRelations(x, locale, dropped);
  }
}

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8")).data;

// ---------------------------------------------------------------- main
const files = fs.readdirSync(path.join(DIR, "payloads")).filter((f) => f.endsWith(".json")).sort();
let done = 0, skipped = 0;
for (const f of files) {
  const [id, locale] = f.replace(/\.json$/, "").split(".");
  if (ONLY && !ONLY.has(id)) continue;
  const kind = id === "tpl-complexitat" ? "template" : "page";
  const key = kind === "template" ? "template-complexitat" : id;
  const payload = read(path.join(DIR, "payloads", f));
  const snapCa = path.join(DIR, "snapshots", `${id}.ca.json`);
  const snapLoc = path.join(DIR, "snapshots", `${id}.${locale}.json`);

  const curCa = await current(kind, key, "ca");
  const curLoc = await current(kind, key, locale);
  // already applied? (current es/en equals the payload once relations are pruned)
  if (curLoc) {
    const probe = JSON.parse(JSON.stringify(payload));
    await pruneRelations(probe, locale, []);
    if (canon(writable(curLoc)) === canon(probe)) {
      console.log(`ALREADY APPLIED ${f}`);
      continue;
    }
  }
  const changed = [];
  // ca may also already be the corrected Catalan of this same batch (payloads/<id>.ca.json)
  const payCa = path.join(DIR, "payloads", `${id}.ca.json`);
  const okCa = (cur) =>
    canon(cur) === canon(read(snapCa)) || (fs.existsSync(payCa) && canon(cur) === canon(read(payCa)));
  if (locale !== "ca" && fs.existsSync(snapCa) && !okCa(writable(curCa))) changed.push("ca");
  if (fs.existsSync(snapLoc) ? !curLoc || canon(writable(curLoc)) !== canon(read(snapLoc)) : !!curLoc)
    changed.push(locale);
  if (changed.length) {
    console.log(`SKIP ${f}: ${changed.join("+")} changed since the snapshot`);
    skipped++;
    continue;
  }
  const dropped = [];
  await pruneRelations(payload, locale, dropped);
  const label = `${f} (${payload.name ?? key}) ${curLoc ? "update" : "NEW translation"}${dropped.length ? ` [not in ${locale}, left out: ${dropped.join(" ")}]` : ""}`;
  if (!APPLY) { console.log(`WOULD WRITE ${label}`); done++; continue; }
  if (curLoc) console.log("   backup:", backup(kind, curLoc));
  if (kind === "template") {
    await http("PUT", `/api/templates/${curLoc.documentId}?locale=${locale}`, { data: payload });
  } else {
    await http("PUT", `/api/pages/${id}?locale=${locale}&status=published`, { data: payload });
  }
  console.log(`WROTE ${label}`);
  done++;
}
console.log(`${done} ${APPLY ? "written" : "to write (dry run, use --apply)"}, ${skipped} skipped`);

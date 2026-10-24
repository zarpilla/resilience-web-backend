#!/usr/bin/env node
/**
 * One-off (task 004, October 2026): Eines disruptives is now ordered by `sortDate`
 * (newest first) instead of "last modified". All resources had the same sortDate
 * (filled in at startup), so this gives each one a distinct sortDate that keeps the
 * order visitors saw on 2026-10-24. New resources get today's date and go on top.
 *
 * Pages with unpublished changes are skipped (publishing would expose them).
 *
 *   RW_API_URL=... RW_API_TOKEN=... node 2026-10-resource-sortdate.mjs [--apply]
 */
const API = (process.env.RW_API_URL || "http://localhost:1337").replace(/\/$/, "");
const TOKEN = process.env.RW_API_TOKEN;
const APPLY = process.argv.includes("--apply");
if (!TOKEN) throw new Error("RW_API_TOKEN required");

// Order VISIBLE on 2026-10-24. Because of a client-side bug (useI18n() in store getters) the
// automatic list never replaced the manual `blogPage` list of the Eines disruptives page, so
// visitors saw that manual order. es/en show the same relative order.
const ORDER = [
  "tzdw5rvurp63kwte2wxtqa5l", // Marcs sistèmics
  "wj328lrl9x1zws0d2xkj3qxh", // Community Catalysts Toolkit
  "nhl7mg0d20t46dim7kfened6", // Patrons internacionals
  "srniqyhwrqudmoxg6oqjm1ix", // L'altre món rural
  "pl0dlk1idfewo1dumou4rptm", // Futurs (im)possibles
  "qzmelpvoo2u7nss9dj5rfkas", // Eines per al jovent ecoactivista
  "u6ufp55tw7e1ox36n52dt95m", // Community Climate Coaches
  "p8pdeqe0fc89ed3m8jlev43e", // Guia per una cultura de pau
  "rwfr1xdalav1n2yywvwhcpmf", // El Sismògraf
  "v7scy9eltnymhq7sdu2aoayt", // De xarxes a ecosistemes cooperatius
];
const BASE = Date.parse("2025-11-07T18:30:00.000Z");
const DAY = 24 * 3600 * 1000;

async function http(method, url, body) {
  const res = await fetch(API + url, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await res.text();
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status} ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : null;
}
const get = async (id, locale, status) =>
  (await http("GET", `/api/pages?locale=${locale}&status=${status}&filters[documentId][$eq]=${id}&fields[0]=slug&fields[1]=sortDate&fields[2]=updatedAt`)).data[0];

for (const locale of ["ca", "es", "en"]) {
  for (const [i, id] of ORDER.entries()) {
    const want = new Date(BASE - i * DAY).toISOString();
    const draft = await get(id, locale, "draft");
    const pub = await get(id, locale, "published");
    if (!draft || !pub) { console.log(`-    ${locale} ${id}: no ${locale} version`); continue; }
    if (pub.sortDate === want && draft.sortDate === want) { console.log(`ok   ${locale} ${pub.slug}`); continue; }
    if (Date.parse(draft.updatedAt) > Date.parse(pub.updatedAt) + 2000) {
      console.log(`SKIP ${locale} ${pub.slug}: has unpublished changes`);
      continue;
    }
    console.log(`${APPLY ? "SET " : "WOULD SET"} ${locale} ${pub.slug}: ${pub.sortDate} -> ${want}`);
    if (APPLY) await http("PUT", `/api/pages/${id}?locale=${locale}&status=published`, { data: { sortDate: want } });
  }
}

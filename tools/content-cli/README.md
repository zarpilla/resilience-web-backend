# rw-content — content CLI for resilience.earth

Single-file Node (≥18) tool, no dependencies, to read and edit the website content through
the Strapi 5 REST API. Made for developers and AI agents (see `docs/agent/AGENT.md`).

```bash
export RW_API_URL=https://api-w.resilience.earth   # default http://localhost:1337
export RW_API_TOKEN=xxxxx                          # only for write commands
node tools/content-cli/rw-content.mjs help
```

## Commands

| Command | What it does |
|---|---|
| `list [--type article] [--locale ca] [--status published\|draft]` | Pages, newest `sortDate` first when filtered by type. |
| `show <slug\|documentId>` | Human summary: fields, translations, every block with its styles and column classes. |
| `get <slug\|documentId>` | Full JSON (populated). |
| `export <slug\|documentId> --out f.json` | Writable JSON (`{"data":…}`): ids stripped, media → id, relations → `{set:[{documentId}]}`. |
| `clone <slug> --name "…" [--slug …]` | New **draft** page copied from another (new slug, `sortDate`=now, `metaTitle`=name). |
| `push f.json --document <id>` / `push f.json --new` | Replace / create a page. Draft unless `--publish`. Creates the locale version if it does not exist yet. |
| `set <page> <field> <value>` | Change one top-level field. |
| `publish <page>` | Publish the current draft. |
| `menus`, `menu <title\|id>` | List menus / show a menu's items. |
| `menu-add <menu> --page <slug> [--at N] [--title …]` | Add a card/item (live immediately). |
| `menu-remove <menu> --index N`, `menu-move <menu> --from N --to M` | Remove / reorder (live). |
| `template <name>` | Show a template. |
| `template-export <name> --out f.json`, `template-push f.json --name <name>` | Edit a template (live on every page using it). Needs token. |
| `media "<text>"` | Search the media library (needs token). |
| `upload <file> [--alt …]` | Upload a file, prints its id. |
| `restore <backup.json>` | Put back a backup written by a previous command. |

Common options: `--locale ca|es|en` (default `ca`), `--status draft|published` (reads,
default `draft`), `--publish` (page writes), `--yes` (required to write to a non-localhost
API).

## Safety

- Every write first saves the current version to `./rw-backups/` (`RW_BACKUP_DIR`).
- Writes to a non-local API are refused without `--yes`.
- The front end renders **published** pages only, so draft pushes are safe to review before
  `publish`. Menus and templates have no drafts: writes are live.

## Strapi 5 REST gotchas handled here

- Component `id`s are rejected on write ("Invalid key id"): components are always re-created.
- Dynamic zones and repeatable components are replaced as a whole.
- Booleans: `null` and `false` are different (`paddingTop: false` ⇒ `pt-0`); values are kept as read.

## Fixes

`fixes/` contains one-off, idempotent content fixes (dry run by default, `--apply` to write).

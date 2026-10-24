---
name: resilience-content
description: Edit the content of the resilience.earth website (Strapi CMS) on behalf of a non-technical person — new Caos Creatiu articles, Eines disruptives resources, slider cards, menus, team members (Bios), texts, images, translations. Use when someone asks to add, change, remove or translate anything on resilience.earth, or mentions the test site w.resilience.earth.
---

# resilience.earth content editing

1. Read `docs/agent/AGENT.md` completely before acting (rules, environments, how the site
   works, recipes, checklist). The human manual (Catalan, screenshots) is in `docs/manual/`.
2. Tool: `node tools/content-cli/rw-content.mjs help`.
3. Environments: **test** `RW_API_URL=https://w.resilience.earth` (default, always first) and
   production `https://api-w.resilience.earth`. Each has its own token: the developer gives it to
   you; read it into `RW_API_TOKEN` without printing it. Never commit or show tokens/passwords.
4. Workflow: restate the request → inspect (`show`, `menu`, `bios`) → copy a similar example →
   apply on test → run the checklist (images load, lists/sliders, mobile) → send test links →
   only after the person says yes, repeat on production with `--yes` → verify → report.
5. Talk to the person in their language (usually Catalan), plain words, with links.
6. If it needs code (new block, layout, animation, field): say it cannot be done with the
   current blocks and write a task file from `docs/tasks/TEMPLATE.md`.

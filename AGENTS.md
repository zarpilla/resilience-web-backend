# Notes for AI agents

This repo is the Strapi 5 backend (CMS) of https://resilience.earth. The Nuxt front end lives
in the sibling repo `resilience-web-frontend`.

- **Editing website content** (pages, articles, sliders, menus...) on behalf of a person:
  follow [docs/agent/AGENT.md](docs/agent/AGENT.md). Use the CLI in
  [tools/content-cli/](tools/content-cli/README.md). Never write to production without explicit approval.
- **How the site works for editors** (Catalan, screenshots): [docs/manual/](docs/manual/README.md).
- **Pending technical work / where to put new tasks**: [docs/tasks/](docs/tasks/README.md).

Code changes: keep the visual output of existing pages identical unless the task says
otherwise; compare screenshots before/after. Admin help texts live in
`src/admin-help/field-help.ts` — update them when you add or change fields.

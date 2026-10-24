# resilience-web-backend

Strapi 5 backend (CMS) of https://resilience.earth.

## Documentation

| For | Where |
|---|---|
| People who edit content (Catalan, with screenshots) | [docs/manual/](docs/manual/README.md) |
| AI agents editing content on someone's behalf | [docs/agent/AGENT.md](docs/agent/AGENT.md) · how to use them: [docs/agent/README.md](docs/agent/README.md) |
| Content CLI (read/clone/edit pages, menus, templates via the API) | [tools/content-cli/](tools/content-cli/README.md) |
| Local copy with production data | [docs/agent/dev-environment.md](docs/agent/dev-environment.md) |
| Pending technical tasks | [docs/tasks/](docs/tasks/README.md) |

Admin help texts (Catalan descriptions under each field) are defined in
`src/admin-help/field-help.ts` and written to the Content Manager configuration on startup
(disable with `ADMIN_FIELD_HELP=false`).

---

# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>

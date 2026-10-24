/**
 * page router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/pages/sections/:id",
      handler: "page.sections",
    },
    {
      method: "GET",
      path: "/pages/templates/:template",
      handler: "page.templates",
    },
    {
      method: "GET",
      path: "/pages/categories",
      handler: "page.categories",
    },
    {
      // Needs an API token (not available to the public role).
      method: "POST",
      path: "/pages/:id/unpublish",
      handler: "page.unpublish",
    },
  ],
};

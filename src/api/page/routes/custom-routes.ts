/**
 * page router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/pages/sections/:id",
      handler: "page.sections",
    },{
      method: "GET",
      path: "/pages/templates/:template",
      handler: "page.templates",
    }
  ],
};

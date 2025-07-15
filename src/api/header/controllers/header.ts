/**
 * header controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::header.header",
  ({ strapi }) => ({
    find: async (ctx, next) => {
      const header = await strapi.documents("api::header.header").findMany({
        filters: {
          locale: ctx.query.locale,
        },
        populate: {
          logo: true,
          logoLink: true,
          emailLink: true,
          social: {
            populate: {
              icon: true,
              hover: true,
            },
          },
          mainMenu: {
            populate: {
                children: {
                    populate: {
                        page: true,
                        children: {
                            populate: {
                                page: true,
                            }
                        },
                        submenu: {
                            populate: {
                                children: {
                                    populate: {
                                        page: true,
                                    }
                                }
                            }
                        }
                    }
                },
            }
          },
          secondaryMenu: {
            populate: {
                children: {
                    populate: {
                        page: true,
                        children: {
                            populate: {
                                page: true,
                            }
                        },
                        submenu: {
                            populate: {
                                children: {
                                    populate: {
                                        page: true,
                                    }
                                }
                            }
                        }
                    }
                },
            }
          },
          logoDark: true,
          favicon: true,
          error404Image: true,
        },
      });
      ctx.body = header[0];
    },
  })
);

/**
 * footer controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::footer.footer",
  ({ strapi }) => ({
    find: async (ctx, next) => {
      const footer = await strapi.documents("api::footer.footer").findMany({
        filters: {
          locale: ctx.query.locale,
        },
        populate: {
          primaryLogo: true,
          secondaryLogo: true,
          middle3Logos: {
            populate: {
              icon: true,
              hover: true,
            },
          },
          middle3BLogos: {
            populate: {
              icon: true,
              hover: true,
            },
          },
          social: {
            populate: {
              icon: true,
              hover: true,
            },
          },
          menu: {
            populate: {
              children: {
                populate: {
                  page: true,
                  children: {
                    populate: {
                      page: true,
                    },
                  },
                  submenu: {
                    populate: {
                      children: {
                        populate: {
                          page: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          subscriptionForm: true,
        },
      });
      ctx.body = footer[0];
    },
  })
);

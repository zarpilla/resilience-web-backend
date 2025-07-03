/**
 * page controller
 */

import { factories } from "@strapi/strapi";

// export default factories.createCoreController('api::page.page');

const sectionsPopulate = {
  sections: {
    on: {
      "sections.hero": {
        populate: {
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
        },
      },
      "sections.columns": {
        populate: {
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
          // 'columns': true
          columns: {
            populate: {
              media: true,
              styles: {
                populate: {
                  backgroundImage: true,
                  backgroundImage2: true,
                },
              },
              c2a: {
                populate: {
                  page: true,
                },
              },
              verticalScroller: {
                populate: {
                  children: {
                    populate: {
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      "sections.tabs": {
        populate: {
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
          tabs: {
            populate: {
              media: true,
              styles: {
                populate: {
                  backgroundImage: true,
                  backgroundImage2: true,
                },
              },
              c2a: {
                populate: {
                  page: true,
                },
              },
              verticalScroller: {
                populate: {
                  children: {
                    populate: {
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      "sections.blog": {
        populate: {
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
          blogPage: {
            populate: {
              page: {
                populate: {
                  metadata: {
                    populate: "shareImage",
                  },
                  scopes: true,
                  year: true,
                  typology: true,
                },
              },
            },
          },
        },
      },
      "sections.masonry": {
        populate: {
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
          pages: {
            populate: {
              page: {
                populate: {
                  metadata: {
                    populate: "shareImage",
                  },
                  scopes: true,
                  year: true,
                  typology: true,
                },
              },
            },
          },
        },
      },
      "sections.menu": {
        populate: {
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
          menu: {
            populate: {
              children: {
                populate: {
                  page: {
                    populate: {
                      metadata: {
                        populate: "shareImage",
                      },
                      scopes: true,
                      year: true,
                      typology: true,
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
                  image: true,
                },
              },
            },
          },
        },
      },
      "sections.slider": {
        populate: {
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
          c2a: {
            populate: {
              page: true,
            },
          },
          menu: {
            populate: {
              children: {
                populate: {
                  page: {
                    populate: {
                      metadata: {
                        populate: "shareImage",
                      },
                      scopes: true,
                      year: true,
                      typology: true,
                    },
                  },
                  submenu: {
                    populate: {
                      children: {
                        populate: {
                          page: {
                            populate: {
                              metadata: {
                                populate: "shareImage",
                              },
                              scopes: true,
                              year: true,
                              typology: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "sections.scroller": {
        populate: {
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
          menu: {
            populate: {
              children: {
                populate: {
                  page: {
                    populate: {
                      metadata: {
                        populate: "shareImage",
                      },
                      scopes: true,
                      year: true,
                      typology: true,
                    },
                  },
                  submenu: {
                    populate: {
                      children: {
                        populate: {
                          page: {
                            populate: {
                              metadata: {
                                populate: "shareImage",
                              },
                              scopes: true,
                              year: true,
                              typology: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  image: true,
                },
              },
            },
          },
        },
      },
      "sections.blurbs": {
        populate: {
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
          blurbs: {
            populate: {
              image: true,
            },
          },
        },
      },
      "sections.bios": {
        populate: {
          bios: {
            populate: {
              mainImage: true,
              largeImage: true,
            },
          },
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
        },
      },
      "sections.capabilities": {
        populate: {
          capabilities: {
            populate: {
              audio: true,
              page: {
                populate: {
                  metadata: {
                    populate: "shareImage",
                  },
                  scopes: true,
                  year: true,
                  typology: true,
                },
              },
            },
          },
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
        },
      },
      "sections.timeline": {
        populate: {
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
        },
      },
      "sections.template": {
        populate: {
          template: true,
        },
      },
      "sections.video": {
        populate: {
          image: true,
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
        },
      },
      "sections.ecosystem": {
        populate: {
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
        },
      },
      "sections.lead-form": {
        populate: {
          styles: {
            populate: {
              backgroundImage: true,
              backgroundImage2: true,
            },
          },
        },
      },
    },
  },
};

export default factories.createCoreController(
  "api::page.page",
  ({ strapi }) => ({
    sections: async (ctx, next) => {
      const page = await strapi.documents("api::page.page").findOne({
        documentId: ctx.params.id,
        locale: ctx.query.locale as string,
        populate: {
          metadata: {
            populate: "shareImage",
          },
          localizations: true,
          ...sectionsPopulate,
        },
      });

      const sectionsPopulateWithoutTemplate = { ...sectionsPopulate };
      delete sectionsPopulateWithoutTemplate.sections["sections.template"];

      // Process templates in reverse order to maintain correct positioning
      for (let i = page.sections.length - 1; i >= 0; i--) {
        const section = page.sections[i];

        if (section.__component === "sections.template") {
          const template = await strapi
            .documents("api::template.template")
            .findOne({
              documentId: section.template.documentId,
              locale: ctx.query.locale as string,
              populate: {
                localizations: true,
                ...sectionsPopulateWithoutTemplate,
              },
            });

          if (template && template.sections) {
            // Remove the template section and insert template sections at the same position
            page.sections.splice(i, 1, ...template.sections);
          }
        }
      }

      ctx.body = page;
    },

    templates: async (ctx, next) => {
      const template = await strapi
        .documents("api::template.template")
        .findFirst({
          filters: {
            name: {
              $eq: ctx.params.template,
            },
          },
          locale: ctx.query.locale as string,
          populate: {
            localizations: true,
            ...sectionsPopulate,
          },
        });
      ctx.body = template;
    },
    categories: async (ctx, next) => {
      const allPages = await strapi.documents("api::page.page").findMany({
        locale: ctx.query.locale as string,
        filters: {
          type: ctx.query.type,
        },
        limit: -1,
        populate: {
          year: true,
          typology: true,
          scopes: true,
        },
      });
      ctx.body = allPages;

      // Example accumulator initialization
      const count = allPages.reduce(
        (acc, page) => {
          if (page.year) {
            acc.years[page.year.id] = (acc.years[page.year.id] || 0) + 1;
          }
          if (page.typology) {
            acc.typologies[page.typology.id] =
              (acc.typologies[page.typology.id] || 0) + 1;
          }
          if (page.scopes) {
            page.scopes.forEach((scope) => {
              acc.scopes[scope.id] = (acc.scopes[scope.id] || 0) + 1;
            });
          }
          return acc;
        },
        { years: {}, typologies: {}, scopes: {} }
      );
      // Convert the accumulator to an array of objects
      const countArray = {
        years: Object.entries(count.years).map(([id, count]) => ({
          id: parseInt(id, 10),
          count,
        })),
        typologies: Object.entries(count.typologies).map(([id, count]) => ({
          id: parseInt(id, 10),
          count,
        })),
        scopes: Object.entries(count.scopes).map(([id, count]) => ({
          id: parseInt(id, 10),
          count,
        })),
      };
      ctx.body = { countArray };
    },
  })
);

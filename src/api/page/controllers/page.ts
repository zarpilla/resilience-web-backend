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

      for (const section of page.sections) {
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
          // section["thetemplate"] = template;

          for (const section of template.sections) {
            page.sections.push(section);
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
  })
);

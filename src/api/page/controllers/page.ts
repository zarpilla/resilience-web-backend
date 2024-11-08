/**
 * page controller
 */

import { factories } from "@strapi/strapi";

// export default factories.createCoreController('api::page.page');

export default factories.createCoreController(
  "api::page.page",
  ({ strapi }) => ({
    sections: async (ctx, next) => {
      const page = await strapi.documents("api::page.page").findOne({
        documentId: ctx.params.id,
        populate: {
          sections: {
            on: {
              "sections.hero": {
                populate: {
                  styles: {
                    populate: "backgroundImage",
                  },
                },
              },
              "sections.columns": {
                populate: {
                  styles: {
                    populate: "backgroundImage",
                  },
                  // 'columns': true
                  columns: {
                    populate: {
                      media: true,
                      styles: {
                        populate: "backgroundImage",
                      },
                      c2a: {
                        populate: {
                          page: true,
                        },
                      },
                    },
                  },
                },
              },
              "sections.blog": {
                populate: {
                  styles: {
                    populate: "backgroundImage",
                  },
                  blogPage: {
                    populate: {
                      page: {
                        populate: {
                          metadata: {
                            populate: "shareImage",
                          },
                        },
                      }
                    },
                  },
                },
              },
              "sections.menu": {
                populate: {
                  styles: {
                    populate: "backgroundImage",
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
                    populate: "backgroundImage",
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
                    populate: "backgroundImage",
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
                    populate: "backgroundImage",
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
                    populate: "backgroundImage",
                  },
                },
              },
              "sections.capabilities": {
                populate: {
                  capabilities: {
                    populate: {
                      audio: true
                    },
                  },
                  styles: {
                    populate: "backgroundImage",
                  },
                },
              },
            },
          },
        },
      });

      ctx.body = page;
    },
  })
);

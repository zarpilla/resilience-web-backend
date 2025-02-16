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
          metadata: {
            populate: "shareImage",
          },
          localizations: true,
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
                      }
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
                populate: true
              }
            },
          },
        },
      });

      ctx.body = page;
    },
  })
);

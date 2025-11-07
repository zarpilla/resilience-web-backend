import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    console.log('Resilience Web Backend is starting up...');
    // we want to update the sortDate of the pages entity if it's null or undefined, only at startup
    const sortDate = new Date();
    strapi.db.query('api::page.page').updateMany({
      where: { sortDate: null },
      data: {
        sortDate: sortDate,
      },
    });
    
  },
};

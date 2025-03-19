/**
 * subscription controller
 */

import { factories } from '@strapi/strapi'
// import { sanitizeEntity } from '@strapi/utils';

// export default factories.createCoreController('api::subscription.subscription');
export default factories.createCoreController('api::subscription.subscription', ({ strapi }) => ({
    async create(ctx) {
        const response = await super.create(ctx);
        // console.log('response', response);
        // const sanitizedEntity = await sanitizeEntity(response, {
        //     model: strapi.models.subscription,
        // });
        return response;
    },
}));
/**
 * Anonymous requests to the content API can only read published content.
 *
 * Strapi 5 lets any caller ask for `?status=draft`, which exposed unpublished
 * pages to the public. Without an Authorization header we force
 * `status=published`. Requests with an API token are untouched (an invalid
 * token is rejected by Strapi's auth later anyway).
 */
export default () => {
  return async (ctx, next) => {
    if (
      ctx.path.startsWith("/api/") &&
      !ctx.request.header.authorization &&
      ctx.query?.status &&
      ctx.query.status !== "published"
    ) {
      ctx.query = { ...ctx.query, status: "published" };
    }
    await next();
  };
};

export default () => ({

    translate: {
        enabled: true,
        config: {
          // Choose one of the available providers
          provider: 'libretranslate',
          // Pass credentials and other options to the provider
          providerOptions: {
            // your API key - required and wil cause errors if not provided
            apiKey: process.env.LIBRETRANSLATE_API_KEY,
            // api url - required
            apiUrl: process.env.LIBRETRANSLATE_API_URL,
            // maximum number of requests per minute - optional, default is `undefined` => no limit
            apiMaxRPM: process.env.LIBRETRANSLATE_API_MAX_RPM || 30,
            // maximum number of chars per request - optional, default is `undefined` => no limit
            apiMaxChars: process.env.LIBRETRANSLATE_API_MAX_CHARS || 5000,
            // maximum number of texts per request
            // apiMaxTexts: 55,
            // manually overwrite the Strapi Locale to LibreTranslate Locale mapping.
            // default is the string before the `-` character for every locale
            // localeMap: {
            //   'en-US': 'de',
            // },
          },
          // other options ...
        },
      },
});

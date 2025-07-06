export default () => ({

    translate: {
        enabled: false,
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
            apiMaxChars: process.env.LIBRETRANSLATE_API_MAX_CHARS || 'undefined',
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
      email: {
        enabled: true,
        config: {
          provider: '@strapi/provider-email-nodemailer',
          providerOptions: {
            host: process.env.SMTP_HOST || 'localhost',
            port: process.env.SMTP_PORT || 587,
            auth: {
              user: process.env.SMTP_USERNAME,
              pass: process.env.SMTP_PASSWORD,
            },
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            // Additional options for different providers
            ...(process.env.SMTP_HOST?.includes('gmail') && {
              service: 'gmail',
            }),
            ...(process.env.SMTP_HOST?.includes('sendgrid') && {
              host: 'smtp.sendgrid.net',
              port: 587,
            }),
          },
          settings: {
            defaultFrom: process.env.SMTP_DEFAULT_FROM || 'noreply@example.com',
            defaultReplyTo: process.env.SMTP_DEFAULT_REPLY_TO || 'noreply@example.com',
          },
        },
      }
});

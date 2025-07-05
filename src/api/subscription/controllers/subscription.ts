/**
 * subscription controller
 */

import { factories } from "@strapi/strapi";

export interface EmailConfig {
  subscriptionEmail1To: string;
  subscriptionEmail1: string;
  subscriptionEmail1Subject: string;
  subscriptionEmail2: string;
  subscriptionEmail2Subject: string;
//   leadEmail1To: string;
//   leadEmail1: string;
//   leadEmail1Subject: string;
//   leadEmail2: string;
//   leadEmail2Subject: string;
}

// export default factories.createCoreController('api::subscription.subscription');
export default factories.createCoreController(
  "api::subscription.subscription",
  ({ strapi }) => ({
    async create(ctx) {
      const response = await super.create(ctx);
      const { data } = ctx.request.body as any;
      const emailConfig = await strapi
        .query("api::email-config.email-config")
        .findMany({
          filters: {
            locale: data.locale,
          },
        });

      if (!emailConfig || emailConfig.length === 0) {
        console.error("No email configuration found for locale:", data.locale);
        return ctx.badRequest(
          "No email configuration found for the specified locale."
        );
      }
      const emailConfigData = emailConfig[0] as EmailConfig;

      // Prepare the email data
      const emailData = {
        to: emailConfigData.subscriptionEmail1To.split(","),
        from: process.env.SMTP_DEFAULT_FROM,
        replyTo: process.env.SMTP_DEFAULT_REPLY_TO,
        subject: emailConfigData.subscriptionEmail1Subject,
        text: emailConfigData.subscriptionEmail1.replace("{email}", data.email),
        html: emailConfigData.subscriptionEmail2.replace("{email}", data.email),
      };

      const emailData2 = !emailConfigData.subscriptionEmail2Subject
        ? null
        : {
            to: data.email,
            from: process.env.SMTP_DEFAULT_FROM,
            // SMTP_DEFAULT_REPLY_TO
            replyTo: process.env.SMTP_DEFAULT_REPLY_TO,
            subject: emailConfigData.subscriptionEmail2Subject,
            text: emailConfigData.subscriptionEmail2.replace(
              "{email}",
              data.email
            ),
            html: emailConfigData.subscriptionEmail2.replace(
              "{email}",
              data.email
            ),
          };

      // Send the email
      try {
        await strapi.plugin("email").service("email").send(emailData);
        console.log("Email sent successfully:");
        if (emailData2) {
          await strapi.plugin("email").service("email").send(emailData2);
          console.log("Confirmation email sent successfully:");
        }
      } catch (error) {
        console.error("Error sending email:", error);
        return ctx.internalServerError("Failed to send email.");
      }
      return response;
    },
  })
);

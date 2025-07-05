# Email Configuration for Resilience Web Backend

This document explains how to configure email functionality using Nodemailer in the Strapi backend.

## Installation

The required packages are already installed:
- `@strapi/provider-email-nodemailer` - Official Strapi provider for Nodemailer

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=false
SMTP_DEFAULT_FROM=noreply@example.com
SMTP_DEFAULT_REPLY_TO=info@example.com
```

## Configuration Options

### Gmail Setup
For Gmail, use these settings:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password  # Use App Password, not regular password
SMTP_SECURE=false
```

**Important**: You need to use an App Password for Gmail, not your regular password. To create an App Password:
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account settings > Security > 2-Step Verification > App passwords
3. Generate a new app password for this application

### SendGrid Setup
For SendGrid, use these settings:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_SECURE=false
```

### Custom SMTP Setup
For other email providers:
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587  # or 465 for SSL
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
SMTP_SECURE=false  # set to true for port 465
```

## Usage in Strapi

Once configured, you can send emails in your Strapi application using:

```javascript
// In a controller or service
await strapi.plugins['email'].services.email.send({
  to: 'recipient@example.com',
  from: 'noreply@example.com',
  subject: 'Subject',
  text: 'Plain text body',
  html: '<h1>HTML body</h1>',
});
```

## Testing Email Configuration

You can test the email configuration by creating a simple controller:

```javascript
// src/api/test/controllers/test.js
module.exports = {
  async sendTestEmail(ctx) {
    try {
      await strapi.plugins['email'].services.email.send({
        to: 'test@example.com',
        from: process.env.SMTP_DEFAULT_FROM,
        subject: 'Test Email from Resilience Web',
        text: 'This is a test email to verify the email configuration.',
        html: '<p>This is a test email to verify the email configuration.</p>',
      });
      
      ctx.body = { message: 'Email sent successfully!' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to send email', details: error.message };
    }
  },
};
```

## Troubleshooting

### Common Issues

1. **Authentication failed**: Check your username and password. For Gmail, ensure you're using an App Password.

2. **Connection timeout**: Verify the SMTP host and port settings.

3. **SSL/TLS issues**: 
   - For port 465, set `SMTP_SECURE=true`
   - For port 587, set `SMTP_SECURE=false`

4. **Blocked by firewall**: Ensure your server can connect to the SMTP provider's servers.

### Debug Mode

To enable debug mode for email issues, you can modify the provider configuration:

```javascript
// In config/plugins.js, add debug options
providerOptions: {
  // ... other options
  debug: true,
  logger: true,
}
```

## Security Considerations

1. Never commit actual credentials to version control
2. Use environment variables for all sensitive information
3. Consider using App Passwords or API keys instead of regular passwords
4. Implement rate limiting for email endpoints to prevent abuse
5. Validate email addresses before sending

## Integration with Lead Forms

The email configuration works seamlessly with the lead form submission. When a lead is submitted through `SectionsLeadForm.vue`, you can configure automatic email notifications:

```javascript
// In the lead creation logic
const leadData = await strapi.entityService.create('api::lead.lead', {
  data: requestData,
});

// Send notification email
await strapi.plugins['email'].services.email.send({
  to: process.env.SMTP_DEFAULT_REPLY_TO,
  from: process.env.SMTP_DEFAULT_FROM,
  subject: `New Lead: ${leadData.subject}`,
  html: `
    <h2>New Lead Submission</h2>
    <p><strong>Name:</strong> ${leadData.name}</p>
    <p><strong>Email:</strong> ${leadData.email}</p>
    <p><strong>Sector:</strong> ${leadData.sector}</p>
    <p><strong>Subject:</strong> ${leadData.subject}</p>
    <p><strong>Message:</strong> ${leadData.message}</p>
  `,
});
```

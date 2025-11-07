/**
 * Email notification endpoint for bootstrap errors
 * 
 * This endpoint sends an email to the developer when critical bootstrap checks fail.
 * 
 * To enable email sending, you need to:
 * 1. Sign up for Resend.com (free tier: 3000 emails/month)
 * 2. Get your API key from https://resend.com/api-keys
 * 3. Add environment variable in Vercel: RESEND_API_KEY=your_api_key_here
 * 4. Verify your domain or use onboarding@resend.dev for testing
 */

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, appName, timestamp, failedChecks, warningChecks, userAgent, url } = req.body;

    // Check if email service is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.log('[Email] RESEND_API_KEY not configured. Email notifications disabled.');
      console.log('[Email] Bootstrap error details:', { appName, failedChecks, timestamp });
      return res.status(200).json({ 
        sent: false, 
        message: 'Email service not configured. Check console for error details.' 
      });
    }

    // Build email content
    const failedChecksHtml = failedChecks.map((check) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb; background-color: #fee2e2;">
          <strong style="color: #dc2626;">❌ ${check.name}</strong><br>
          <span style="color: #6b7280;">${check.message}</span>
          ${check.details ? `<br><code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${JSON.stringify(check.details)}</code>` : ''}
        </td>
      </tr>
    `).join('');

    const warningChecksHtml = warningChecks.length > 0 ? warningChecks.map((check) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb; background-color: #fef3c7;">
          <strong style="color: #f59e0b;">⚠️ ${check.name}</strong><br>
          <span style="color: #6b7280;">${check.message}</span>
        </td>
      </tr>
    `).join('') : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">⚠️ Bootstrap Error Alert</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">${appName}</p>
        </div>
        
        <div style="background: white; border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Bootstrap Checks Failed</h2>
          
          <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
          <p><strong>URL:</strong> <a href="${url}">${url}</a></p>
          
          <h3 style="color: #dc2626; margin-top: 25px;">❌ Failed Checks</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${failedChecksHtml}
          </table>
          
          ${warningChecks.length > 0 ? `
            <h3 style="color: #f59e0b; margin-top: 25px;">⚠️ Warnings</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${warningChecksHtml}
            </table>
          ` : ''}
          
          <div style="margin-top: 25px; padding: 15px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>User Agent:</strong><br>${userAgent}</p>
          </div>
          
          <div style="margin-top: 25px; padding: 15px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; font-size: 13px; color: #1f2937;">
              <strong>💡 Next Steps:</strong><br>
              1. Check Vercel deployment logs<br>
              2. Verify Neon database is running<br>
              3. Test API endpoints manually<br>
              4. Review application logs
            </p>
          </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          <p>This is an automated notification from ${appName}</p>
          <p>Powered by Vercel Serverless Functions</p>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${appName} Alerts <onboarding@resend.dev>`, // Use verified domain in production
        to: [to],
        subject: subject,
        html: emailHtml
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('[Email] Notification sent successfully:', result);
      return res.status(200).json({ sent: true, emailId: result.id });
    } else {
      console.error('[Email] Failed to send:', result);
      return res.status(500).json({ sent: false, error: result.message });
    }
  } catch (error) {
    console.error('[Email] Error:', error);
    return res.status(500).json({ 
      sent: false, 
      error: error.message 
    });
  }
};


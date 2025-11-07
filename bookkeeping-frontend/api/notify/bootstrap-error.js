import { sendBootstrapErrorEmail } from '../../../shared-components/src/utils/email-notifier.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { appName, environment, errorType, errorMessage, timestamp, additionalInfo } = req.body;

    // Validate required fields
    if (!appName || !errorMessage || !timestamp) {
      return res.status(400).json({ 
        error: 'Missing required fields: appName, errorMessage, timestamp' 
      });
    }

    // Get Resend API key from environment
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({ 
        error: 'Email service not configured' 
      });
    }

    // Send email using shared utility
    const result = await sendBootstrapErrorEmail(
      {
        resendApiKey,
        fromEmail: 'BookKeeper Pro <notifications@mariomuja.dev>',
        toEmail: 'mario.muja@gmail.com'
      },
      {
        appName,
        environment: environment || 'Production',
        errorType: errorType || 'Bootstrap Error',
        errorMessage,
        timestamp,
        additionalInfo
      }
    );

    if (!result.success) {
      return res.status(500).json({ 
        error: 'Failed to send email',
        details: result.error 
      });
    }

    return res.status(200).json({ 
      success: true,
      messageId: result.messageId,
      message: 'Email notification sent successfully' 
    });

  } catch (error) {
    console.error('Email notification error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

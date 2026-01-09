// Email service using Resend API for newsletter delivery
import { Resend } from 'resend'
import { supabase } from './supabaseClient'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailRecipient {
  email: string
  name?: string
  userId: string
}

export interface NewsletterEmailData {
  subject: string
  content: string // Markdown content
  newsItemCount: number
  generationMethod: 'template' | 'ai'
  dataSources: string[]
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send a newsletter email to a user
 */
export async function sendNewsletterEmail(
  recipient: EmailRecipient,
  newsletterData: NewsletterEmailData
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.error('[Email] RESEND_API_KEY not configured')
    return {
      success: false,
      error: 'Email service not configured'
    }
  }

  try {
    console.log(`[Email] Sending newsletter to ${recipient.email}`)

    // Convert markdown to HTML
    const htmlContent = markdownToHtml(newsletterData.content)

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'SoulThread Newsletter <newsletter@soulthread.app>', // Update with your domain
      to: recipient.email,
      subject: newsletterData.subject,
      html: htmlContent,
      text: newsletterData.content, // Plain text fallback
      headers: {
        'X-Entity-Ref-ID': recipient.userId, // For tracking
      },
      tags: [
        { name: 'category', value: 'newsletter' },
        { name: 'generation', value: newsletterData.generationMethod }
      ]
    })

    if (error) {
      console.error('[Email] Send error:', error)

      // Log failed delivery
      await logEmailDelivery({
        userId: recipient.userId,
        emailTo: recipient.email,
        subjectLine: newsletterData.subject,
        status: 'failed',
        errorMessage: error.message || 'Unknown error',
        newsItemsCount: newsletterData.newsItemCount,
        generationMethod: newsletterData.generationMethod,
        dataSources: newsletterData.dataSources
      })

      return {
        success: false,
        error: error.message || 'Failed to send email'
      }
    }

    console.log(`[Email] Successfully sent to ${recipient.email}, ID: ${data?.id}`)

    // Log successful delivery
    await logEmailDelivery({
      userId: recipient.userId,
      emailTo: recipient.email,
      subjectLine: newsletterData.subject,
      status: 'sent',
      providerMessageId: data?.id,
      newsItemsCount: newsletterData.newsItemCount,
      generationMethod: newsletterData.generationMethod,
      dataSources: newsletterData.dataSources
    })

    // Update user's last email sent timestamp
    await updateLastEmailSent(recipient.userId)

    return {
      success: true,
      messageId: data?.id
    }

  } catch (error: any) {
    console.error('[Email] Unexpected error:', error)

    await logEmailDelivery({
      userId: recipient.userId,
      emailTo: recipient.email,
      subjectLine: newsletterData.subject,
      status: 'failed',
      errorMessage: error.message || 'Unexpected error',
      newsItemsCount: newsletterData.newsItemCount,
      generationMethod: newsletterData.generationMethod,
      dataSources: newsletterData.dataSources
    })

    return {
      success: false,
      error: error.message || 'Unexpected error'
    }
  }
}

/**
 * Send test email to verify setup
 */
export async function sendTestEmail(email: string): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SoulThread <newsletter@soulthread.app>',
      to: email,
      subject: '🧵 SoulThread Test Email - Your Newsletter Setup is Working!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">🎉 Success!</h1>
          <p>Your SoulThread email integration is working perfectly!</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">What's Next?</h2>
            <ul>
              <li>✅ Configure your email preferences</li>
              <li>✅ Set your preferred delivery time</li>
              <li>✅ Choose your favorite topics</li>
              <li>✅ Start receiving daily newsletters!</li>
            </ul>
          </div>

          <p>You'll receive your first personalized newsletter at your scheduled time.</p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Powered by SoulThread 🧵<br>
            <a href="https://soulthread.app">soulthread.app</a>
          </p>
        </div>
      `,
      tags: [{ name: 'category', value: 'test' }]
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Send batch emails (for daily cron job)
 */
export async function sendBatchNewsletters(
  recipients: EmailRecipient[],
  newsletterDataPerUser: Map<string, NewsletterEmailData>
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[]
  }

  // Send emails with rate limiting (avoid hitting API limits)
  const BATCH_SIZE = 10 // Send 10 at a time
  const DELAY_MS = 1000 // 1 second between batches

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)

    const batchPromises = batch.map(async (recipient) => {
      const newsletterData = newsletterDataPerUser.get(recipient.userId)
      if (!newsletterData) {
        results.failed++
        results.errors.push(`No newsletter data for user ${recipient.userId}`)
        return
      }

      const result = await sendNewsletterEmail(recipient, newsletterData)
      if (result.success) {
        results.sent++
      } else {
        results.failed++
        results.errors.push(`${recipient.email}: ${result.error}`)
      }
    })

    await Promise.all(batchPromises)

    // Delay between batches
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }
  }

  console.log(`[Email] Batch complete: ${results.sent} sent, ${results.failed} failed`)

  return results
}

/**
 * Log email delivery to database
 */
async function logEmailDelivery(data: {
  userId: string
  emailTo: string
  subjectLine: string
  status: 'pending' | 'sent' | 'failed'
  providerMessageId?: string
  errorMessage?: string
  newsItemsCount: number
  generationMethod: 'template' | 'ai'
  dataSources: string[]
}) {
  try {
    const { error } = await supabase
      .from('email_delivery_log')
      .insert({
        user_id: data.userId,
        email_to: data.emailTo,
        subject_line: data.subjectLine,
        status: data.status,
        provider_message_id: data.providerMessageId,
        error_message: data.errorMessage,
        news_items_count: data.newsItemsCount,
        generation_method: data.generationMethod,
        data_sources: data.dataSources,
        sent_at: data.status === 'sent' ? new Date().toISOString() : null
      })

    if (error) {
      console.error('[Email] Failed to log delivery:', error)
    }
  } catch (error) {
    console.error('[Email] Log error:', error)
  }
}

/**
 * Update user's last email sent timestamp
 */
async function updateLastEmailSent(userId: string) {
  try {
    await supabase
      .from('email_preferences')
      .update({ last_email_sent_at: new Date().toISOString() })
      .eq('user_id', userId)
  } catch (error) {
    console.error('[Email] Failed to update last sent timestamp:', error)
  }
}

/**
 * Convert markdown to HTML (basic implementation)
 * For production, consider using a library like 'marked' or 'remark'
 */
function markdownToHtml(markdown: string): string {
  let html = markdown

  // Wrap in email container
  html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #1f2937;
          font-size: 28px;
          margin-bottom: 20px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 10px;
        }
        h2 {
          color: #374151;
          font-size: 20px;
          margin-top: 30px;
          margin-bottom: 15px;
        }
        h3 {
          color: #4b5563;
          font-size: 18px;
        }
        a {
          color: #2563eb;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 30px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
          text-align: center;
        }
        code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 14px;
        }
        strong {
          color: #1f2937;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${html}
        <div class="footer">
          <p>Sent by <strong>SoulThread 🧵</strong></p>
          <p>
            <a href="{{unsubscribe_url}}">Unsubscribe</a> |
            <a href="{{preferences_url}}">Email Preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  // Basic markdown conversions
  html = html
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '<p>')
    .replace(/(?<![>])$/gm, '</p>')

  return html
}

/**
 * Get email delivery stats for a user
 */
export async function getEmailStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_email_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    return data

  } catch (error) {
    console.error('[Email] Failed to get stats:', error)
    return null
  }
}

/**
 * Check if Resend is properly configured
 */
export function isEmailServiceConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

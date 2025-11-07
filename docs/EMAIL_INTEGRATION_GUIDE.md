# 📧 Email Integration Guide for SoulThread

Complete guide to implementing daily personalized newsletter emails.

---

## 🎯 Overview

This feature allows users to receive daily personalized newsletters via email, with:
- ✅ Customizable topics and delivery times
- ✅ AI-generated or template-based content
- ✅ Fresh news from Perplexity AI + other sources
- ✅ Beautiful HTML email templates
- ✅ Delivery tracking and analytics

---

## 🏗️ Architecture

### Components Created:

1. **Database Schema** - `database-migrations/EMAIL_INTEGRATION_MIGRATION.sql`
   - `email_preferences` - User email settings
   - `email_delivery_log` - Delivery tracking
   - `email_schedule_queue` - Scheduling system
   - `news_cache` - News caching for cost optimization

2. **News Fetching** - `lib/perplexityFetcher.ts`
   - Perplexity AI integration for real-time news
   - Caching system to reduce API costs
   - Fallback to existing news sources

3. **Email Service** - `lib/emailService.ts`
   - Resend API integration
   - HTML email generation
   - Batch sending with rate limiting
   - Delivery logging

4. **API Endpoints** (to create):
   - `POST /api/email/preferences` - Update email settings
   - `GET /api/email/preferences` - Get email settings
   - `POST /api/email/test` - Send test email
   - `GET /api/email/stats` - Get delivery stats
   - `POST /api/cron/send-newsletters` - Daily cron job

5. **UI Components** (to create):
   - Email preferences page in Settings
   - Email stats dashboard
   - Test email button

---

## 🚀 Implementation Steps

### Step 1: Install Dependencies

```bash
cd soulthread
npm install resend
```

### Step 2: Environment Variables

Add to `.env.local`:

```env
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx  # Get from https://resend.com/api-keys

# Perplexity AI (Optional - for premium news)
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxx  # Get from https://www.perplexity.ai/settings/api

# Email Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change in production
EMAIL_FROM_DOMAIN=newsletter@yourdomain.com  # Configure in Resend
```

### Step 3: Run Database Migration

1. Go to Supabase SQL Editor
2. Run `database-migrations/EMAIL_INTEGRATION_MIGRATION.sql`
3. Verify tables created: `email_preferences`, `email_delivery_log`, `email_schedule_queue`, `news_cache`

### Step 4: Configure Resend

1. Sign up at [resend.com](https://resend.com)
2. Add your sending domain (or use `onboarding@resend.dev` for testing)
3. Create API key and add to `.env.local`
4. Update `EMAIL_FROM_DOMAIN` in code

### Step 5: Create API Routes

#### `app/api/email/preferences/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is ok
      throw error
    }

    return NextResponse.json({ preferences: data || getDefaultPreferences() })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await request.json()

    const { data, error } = await supabase
      .from('email_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, preferences: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function getDefaultPreferences() {
  return {
    email_enabled: false,
    email_frequency: 'daily',
    delivery_time: 'morning',
    delivery_hour: 9,
    timezone: 'UTC',
    topics: ['technology'],
    preferred_sources: ['reddit', 'hackernews', 'github', 'perplexity'],
    content_length: 'medium',
    max_items: 8,
    use_ai_generation: false,
    include_images: true,
    include_commentary: true
  }
}
```

#### `app/api/email/test/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail } from '@/lib/emailService'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()
    const result = await sendTestEmail(email || user.email)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      messageId: result.messageId
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

#### `app/api/cron/send-newsletters/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { sendBatchNewsletters } from '@/lib/emailService'
import { generateNewsletterWithTemplate } from '@/lib/templateGenerate'
import { generateNewsletterWithOpenAI } from '@/lib/openaiGenerate'
import { fetchPerplexityNews } from '@/lib/perplexityFetcher'
import { fetchAllNewsSources } from '@/lib/newsFetcher'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Cron] Starting daily newsletter send...')

    // Get all users with email enabled who should receive newsletter today
    const currentHour = new Date().getUTCHours()

    const { data: users, error } = await supabase
      .from('email_preferences')
      .select('user_id, delivery_hour, timezone, topics, preferred_sources, use_ai_generation, max_items')
      .eq('email_enabled', true)
      .eq('email_frequency', 'daily')

    if (error) throw error

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users to send to' })
    }

    console.log(`[Cron] Found ${users.length} users with email enabled`)

    // Filter users whose delivery time matches current hour
    const usersToSendTo = users.filter(user => {
      // TODO: Implement proper timezone conversion
      // For now, using delivery_hour directly
      return user.delivery_hour === currentHour
    })

    console.log(`[Cron] ${usersToSendTo.length} users scheduled for this hour`)

    if (usersToSendTo.length === 0) {
      return NextResponse.json({ message: 'No users scheduled for this hour' })
    }

    // Generate newsletters for each user
    const newsletterMap = new Map()
    const recipients = []

    for (const userPref of usersToSendTo) {
      try {
        // Get user email
        const { data: userData } = await supabase.auth.admin.getUserById(userPref.user_id)
        if (!userData?.user?.email) continue

        // Get user's voice profile
        const { data: voiceProfile } = await supabase
          .from('voicedna')
          .select('data')
          .eq('user_id', userPref.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Fetch news based on user preferences
        let newsItems = []
        const sources = userPref.preferred_sources || ['reddit', 'hackernews']

        // Try Perplexity first if in preferred sources
        if (sources.includes('perplexity')) {
          const perplexityNews = await fetchPerplexityNews(
            userPref.topics?.[0] || 'technology',
            userPref.max_items || 8
          )
          newsItems.push(...perplexityNews)
        }

        // Fallback to other sources if needed
        if (newsItems.length < (userPref.max_items || 8)) {
          const otherNews = await fetchAllNewsSources()
          newsItems.push(...otherNews.allSources)
        }

        // Limit to max_items
        newsItems = newsItems.slice(0, userPref.max_items || 8)

        // Generate newsletter
        let content = ''
        let generationMethod: 'template' | 'ai' = 'template'

        if (userPref.use_ai_generation && process.env.OPENAI_API_KEY) {
          try {
            content = await generateNewsletterWithOpenAI(
              voiceProfile?.data,
              newsItems
            )
            generationMethod = 'ai'
          } catch (error) {
            console.warn(`[Cron] OpenAI failed for user ${userPref.user_id}, using template`)
            content = generateNewsletterWithTemplate(voiceProfile?.data, newsItems)
          }
        } else {
          content = generateNewsletterWithTemplate(voiceProfile?.data, newsItems)
        }

        // Generate subject line
        const mainTopic = newsItems[0]?.title || 'Latest Updates'
        const subject = `📰 ${mainTopic.substring(0, 50)}...`

        newsletterMap.set(userPref.user_id, {
          subject,
          content,
          newsItemCount: newsItems.length,
          generationMethod,
          dataSources: sources
        })

        recipients.push({
          userId: userPref.user_id,
          email: userData.user.email,
          name: userData.user.user_metadata?.name
        })

      } catch (error) {
        console.error(`[Cron] Error generating newsletter for user ${userPref.user_id}:`, error)
      }
    }

    // Send batch emails
    const results = await sendBatchNewsletters(recipients, newsletterMap)

    console.log(`[Cron] Newsletter send complete:`, results)

    return NextResponse.json({
      success: true,
      totalUsers: usersToSendTo.length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors
    })

  } catch (error: any) {
    console.error('[Cron] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### Step 6: Configure Vercel Cron Job

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-newsletters",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs every hour. The endpoint filters users by delivery_hour.

### Step 7: Add UI for Email Preferences

Add to `app/settings/page.tsx` (in the Settings tabs):

```typescript
{/* Email Tab */}
{activeTab === 'email' && (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-semibold text-black mb-6">Email Newsletter</h2>

    {/* Enable/Disable */}
    <div className="mb-6">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={emailEnabled}
          onChange={(e) => setEmailEnabled(e.target.checked)}
          className="mr-2"
        />
        <span className="text-lg">Receive daily newsletters via email</span>
      </label>
    </div>

    {emailEnabled && (
      <>
        {/* Delivery Time */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Delivery Time</label>
          <select
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="morning">Morning (9 AM)</option>
            <option value="afternoon">Afternoon (2 PM)</option>
            <option value="evening">Evening (6 PM)</option>
          </select>
        </div>

        {/* Topics */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Topics</label>
          <input
            type="text"
            value={emailTopics}
            onChange={(e) => setEmailTopics(e.target.value)}
            placeholder="e.g., AI, technology, startups"
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">Comma-separated topics</p>
        </div>

        {/* AI Generation */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="mr-2"
            />
            <span>Use AI generation (more natural, costs ~$0.01/email)</span>
          </label>
        </div>

        {/* Test Email */}
        <button
          onClick={handleSendTestEmail}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send Test Email
        </button>
      </>
    )}

    <button
      onClick={handleSaveEmailPreferences}
      className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
    >
      Save Email Settings
    </button>
  </div>
)}
```

---

## 💰 Cost Breakdown

### Free Tier (Recommended for Launch):

- **Resend**: 3,000 emails/month FREE
  - Supports 100 users × 30 days
- **Perplexity API**: ~$5/month for 1,000 queries
  - Can be optional, fallback to free APIs
- **Hosting**: Vercel FREE (cron jobs included)

**Total**: $0-5/month for first 100 users

### Scaling Costs:

| Users | Emails/Month | Resend Cost | Perplexity | Total/Month |
|-------|--------------|-------------|------------|-------------|
| 100 | 3,000 | $0 | $5 | $5 |
| 500 | 15,000 | $20 | $20 | $40 |
| 1,000 | 30,000 | $20 | $40 | $60 |
| 5,000 | 150,000 | $90 | $200 | $290 |

---

## 🧪 Testing

### Test Checklist:

1. ✅ Run database migration
2. ✅ Configure Resend API key
3. ✅ Send test email: `POST /api/email/test`
4. ✅ Save email preferences
5. ✅ Manually trigger cron: `POST /api/cron/send-newsletters`
6. ✅ Verify email received
7. ✅ Check delivery log in database
8. ✅ Test unsubscribe flow
9. ✅ Check email stats

### Manual Cron Test:

```bash
# Add to .env.local
CRON_SECRET=your_secret_key_here

# Test locally
curl -X POST http://localhost:3000/api/cron/send-newsletters \
  -H "Authorization: Bearer your_secret_key_here"
```

---

## 📊 Monitoring

### Check Email Stats:

```sql
-- Supabase SQL Editor

-- Overall delivery stats
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER() * 100, 2) as percentage
FROM email_delivery_log
GROUP BY status;

-- Per-user stats
SELECT * FROM user_email_stats ORDER BY total_emails DESC LIMIT 10;

-- Recent deliveries
SELECT
  email_to,
  subject_line,
  status,
  sent_at
FROM email_delivery_log
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🚀 Deployment

1. Push code to GitHub
2. Deploy to Vercel
3. Add environment variables in Vercel dashboard
4. Verify cron job is active in Vercel dashboard
5. Test with real users

---

## 🔧 Troubleshooting

### Issue: Emails not sending

- Check `RESEND_API_KEY` is set
- Verify domain is configured in Resend
- Check `email_delivery_log` for errors
- Test with `/api/email/test`

### Issue: Cron not running

- Verify `vercel.json` is deployed
- Check Vercel dashboard → Cron Jobs
- Verify `CRON_SECRET` matches
- Check Vercel function logs

### Issue: High costs

- Disable Perplexity for some users
- Increase cache duration for news
- Use template generation instead of AI
- Reduce email frequency

---

## 🎯 Future Enhancements

- [ ] Email analytics dashboard
- [ ] A/B testing for subject lines
- [ ] Email templates customization
- [ ] Weekly digest option
- [ ] RSS feed subscriptions
- [ ] Mobile app notifications
- [ ] Unsubscribe management
- [ ] Email verification flow
- [ ] Bounce handling
- [ ] Engagement tracking (opens, clicks)

---

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [Perplexity API Docs](https://docs.perplexity.ai/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [React Email](https://react.email/) (for better templates)

---

Built with ❤️ for SoulThread 🧵

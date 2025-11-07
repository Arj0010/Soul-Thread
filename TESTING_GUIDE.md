# 🧪 Email Integration - Testing Guide

## ✅ What Was Created

### API Endpoints (3 files):
1. ✅ `app/api/email/preferences/route.ts` - Save/load email preferences
2. ✅ `app/api/email/test/route.ts` - Send test emails
3. ✅ `app/api/cron/send-newsletters/route.ts` - Daily cron job

### UI Updates:
4. ✅ Added Email Newsletter tab to Settings page
5. ✅ Complete email preferences form with all options

### Configuration:
6. ✅ `vercel.json` - Cron job configuration (runs every hour)
7. ✅ `package.json` - Added `resend` dependency
8. ✅ Dependencies installed successfully

---

## 🚀 Quick Test (5 Minutes)

### Step 1: Add Environment Variables

Add to `.env.local`:

```env
# Required for email testing
RESEND_API_KEY=re_your_key_here

# Optional (for premium news)
PERPLEXITY_API_KEY=pplx_your_key_here

# For cron job security
CRON_SECRET=your_random_secret_12345

# Email domain (update this)
EMAIL_FROM_DOMAIN=newsletter@yourdomain.com
```

**Get Resend API Key:**
1. Go to https://resend.com
2. Sign up (free tier: 3,000 emails/month)
3. Create API key
4. Paste in `.env.local`

**For testing**, you can use Resend's test domain:
- Change `EMAIL_FROM_DOMAIN` to `onboarding@resend.dev`

---

### Step 2: Start Development Server

```bash
cd soulthread
npm run dev
```

Open http://localhost:3000

---

### Step 3: Test Email Preferences

1. **Login to your app**
   - Go to http://localhost:3000
   - Login with your account

2. **Go to Settings → Email Newsletter tab**
   - Click Settings in navbar
   - Click "📧 Email Newsletter" tab

3. **Configure preferences**
   - ✅ Check "Receive Daily Newsletters"
   - Select delivery time (Morning/Afternoon/Evening)
   - Enter topics: "AI, technology, startups"
   - Optionally check "Use AI Generation"

4. **Click "Send Test Email"**
   - Should show alert: "✅ Test email sent successfully!"
   - Check your email inbox
   - You should receive a test email

5. **Click "Save Email Preferences"**
   - Should show: "Email preferences saved successfully!"

---

### Step 4: Verify Database

Open Supabase SQL Editor and run:

```sql
-- Check email preferences saved
SELECT * FROM email_preferences;

-- Should show your user_id with email_enabled = true
```

---

### Step 5: Test Cron Job Manually (Optional)

```bash
# In another terminal, test the cron endpoint
curl -X POST http://localhost:3000/api/cron/send-newsletters \
  -H "Authorization: Bearer your_random_secret_12345" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "No users scheduled for hour X",
  "totalUsers": 1,
  "scheduledThisHour": 0
}
```

This is normal! The cron job only sends emails at the hour you configured (9 AM, 2 PM, or 6 PM UTC).

---

## ✅ Test Checklist

### Basic Tests:
- [ ] Environment variables added
- [ ] Dev server starts without errors
- [ ] Email Newsletter tab appears in Settings
- [ ] Can toggle "Receive Daily Newsletters"
- [ ] Can select delivery time
- [ ] Can enter topics
- [ ] "Send Test Email" button works
- [ ] Test email received in inbox
- [ ] "Save Email Preferences" works
- [ ] Preferences persist after page reload

### Database Tests:
- [ ] `email_preferences` table has data
- [ ] `email_enabled` is `true`
- [ ] `topics` array is correct
- [ ] `delivery_time` is saved

### Email Tests:
- [ ] Test email has subject line
- [ ] Test email has HTML content
- [ ] Test email renders properly
- [ ] Links in email work

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'resend'"

**Solution:**
```bash
npm install
```

### Issue: "RESEND_API_KEY not configured"

**Solution:**
- Add `RESEND_API_KEY=re_xxx` to `.env.local`
- Restart dev server (`npm run dev`)

### Issue: Test email not received

**Possible causes:**
1. **Wrong API key** - Verify in Resend dashboard
2. **Email in spam** - Check spam folder
3. **Domain not verified** - Use `onboarding@resend.dev` for testing
4. **Rate limit** - Wait a minute and try again

**Check logs:**
```bash
# In terminal running dev server, you should see:
[Email] Sending test email to user: xxx
[Email] Sending to: your@email.com
[Email] Successfully sent, message ID: xxx
```

### Issue: Preferences not saving

**Check:**
1. Open browser DevTools → Network tab
2. Click "Save Email Preferences"
3. Look for POST request to `/api/email/preferences`
4. Check response for errors

**Common errors:**
- `Unauthorized` - Not logged in
- `Failed to save` - Database issue (check Supabase)

### Issue: Cron job returns 401 Unauthorized

**Solution:**
- Make sure `CRON_SECRET` in `.env.local` matches the Bearer token in curl command
- Example: If `.env.local` has `CRON_SECRET=abc123`, use `-H "Authorization: Bearer abc123"`

---

## 📊 Expected Database Schema

After running the migration, you should have these tables:

```sql
-- 1. email_preferences
CREATE TABLE email_preferences (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  email_enabled BOOLEAN,
  delivery_time VARCHAR(20),
  delivery_hour INTEGER,
  topics JSONB,
  preferred_sources JSONB,
  use_ai_generation BOOLEAN,
  ...
);

-- 2. email_delivery_log
CREATE TABLE email_delivery_log (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  email_to VARCHAR(255),
  subject_line TEXT,
  status VARCHAR(20),
  sent_at TIMESTAMP,
  ...
);

-- 3. email_schedule_queue
CREATE TABLE email_schedule_queue (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  scheduled_for TIMESTAMP,
  status VARCHAR(20),
  ...
);

-- 4. news_cache
CREATE TABLE news_cache (
  id UUID PRIMARY KEY,
  source VARCHAR(50),
  topic VARCHAR(100),
  news_items JSONB,
  expires_at TIMESTAMP,
  ...
);
```

---

## 🎯 What Happens Next?

### After Deployment to Vercel:

1. **Cron job runs every hour** (`0 * * * *`)
2. At your delivery hour (e.g., 9 AM), you receive email
3. Email contains:
   - 8 news items matching your topics
   - Personalized to your voice profile
   - Fresh news from APIs
   - Beautiful HTML design

### Testing in Production:

1. Deploy to Vercel
2. Add environment variables in Vercel dashboard
3. Verify cron job is active (Vercel Dashboard → Cron Jobs)
4. Wait for your delivery hour
5. Check email inbox

---

## 📧 Email Preview

**Subject:** 📰 Perplexity Raises $500M at $9B Valuation...

**Content:**
- Personalized greeting
- 8 news sections with emojis (🔥💡🚀⚡🎯🌟💻🔮)
- Commentary matching your tone
- Links to articles
- Professional footer
- Unsubscribe link

---

## 🚀 Production Checklist

Before deploying:

- [ ] All tests pass locally
- [ ] Environment variables documented
- [ ] Resend API key obtained
- [ ] Domain configured in Resend (or using onboarding@resend.dev)
- [ ] Cron secret generated
- [ ] Database migration run in production Supabase
- [ ] `vercel.json` committed to repo
- [ ] Code pushed to GitHub

---

## 💡 Tips

1. **Start with test email** - Always test before enabling daily emails
2. **Use template mode** - FREE and works great
3. **Check spam folder** - First email might go to spam
4. **Monitor logs** - Check Vercel function logs for errors
5. **Start small** - Test with 1 user (yourself) first

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ Test email arrives in your inbox
2. ✅ Email looks good (HTML formatted)
3. ✅ Preferences save without errors
4. ✅ Database shows correct data
5. ✅ No errors in console logs

---

## 📈 Next Steps

After basic testing:

1. **Enable for yourself** - Receive daily newsletters
2. **Monitor for a week** - Check reliability
3. **Invite beta testers** - Get feedback
4. **Add analytics** - Track open rates
5. **Scale up** - Invite more users

---

Built with ❤️ for SoulThread 🧵
Happy Testing! 🎉

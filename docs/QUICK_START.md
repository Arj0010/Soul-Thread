# 🚀 SoulThread Quick Start - Community Features

## Step 1: Database Setup (5 minutes)

1. Open your Supabase project
2. Go to SQL Editor
3. Copy and paste `DATABASE_COMMUNITY_MIGRATION.sql`
4. Click "Run"
5. Wait for "Success" confirmation

**That's it!** All tables, policies, and triggers are now set up.

---

## Step 2: Start the App

```bash
cd soulthread
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 3: Explore New Features

### 🎯 Voice Trainer (Enhanced)
**Route**: `/voice`

1. Paste a writing sample (100+ words)
2. Click "Analyze Writing"
3. See instant results:
   - Word count, sentence length
   - Sentiment, keywords
4. Auto-fills your voice profile
5. Click "Export Voice DNA" to download JSON

---

### 📊 Trends Feed
**Route**: `/trends`

1. View local curated trends
2. Click "Fetch Live Trends" for:
   - Reddit r/technology
   - Reddit r/Fitness
   - Hacker News
3. Filter by source
4. Click "Copy" to use in newsletter

---

### 🌍 Community
**Route**: `/community`

**Public Feed Tab**:
- Browse public drafts
- Click ▲ to upvote
- Click "Comment" to add comment
- Click author name to view profile

**My Drafts Tab**:
- Toggle "Publish" to share
- See upvote counts
- Manage visibility

---

### 🏆 Challenges
**Route**: `/challenges`

- View your current streak 🔥
- See total drafts & upvotes
- Read daily writing prompt
- Get daily motivational quote
- Track badge progress
- Earn 8 unique badges

---

### 📈 Analytics
**Route**: `/analytics`

- Total drafts created
- Average word count
- Top 10 most used words
- Drafts by month chart
- Writing insights

---

### 👤 Profile
**Route**: `/profile/[user-id]`

- View any user's profile
- See their badges
- Browse their public drafts
- Check their stats

---

## 🎮 Earning Your First Badge

### Beginner Badge 🌱
1. Go to `/ai-drafts` or `/templates`
2. Create 1 newsletter
3. Save as draft
4. Go to `/challenges` - Badge earned!

### Voice Master Badge 🎤
1. Go to `/voice`
2. Paste writing sample
3. Click "Analyze Writing"
4. Click "Save Voice Profile"
5. Badge unlocked!

### Week Warrior Badge ⚔️
1. Create a draft today
2. Come back tomorrow and create another
3. Repeat for 7 days
4. Badge unlocked!

---

## 🛠️ Using Smart Tools

Smart Tools are available as a component. Here's how to use them:

### In Any Page
```tsx
import SmartTools from '@/components/SmartTools'

<SmartTools onInsert={(text) => {
  // Insert text into your editor
}} />
```

### Tools Available
1. **Headline Generator**: Enter topic → Get headline
2. **Grammar Check**: Paste text → Get suggestions
3. **Tone Adjuster**: Slide formal ↔ casual → Get rewrite

---

## 📊 Free APIs - No Setup Needed

All APIs are free and public:
- ✅ Reddit JSON API
- ✅ Hacker News API
- ✅ LanguageTool (free tier)
- ✅ ZenQuotes API

No API keys required!

---

## 🔐 Privacy & Security

- ✅ Voice analysis = 100% client-side (offline)
- ✅ Analytics = computed in browser (no tracking)
- ✅ Row-level security on all tables
- ✅ Users only see their own private data
- ✅ Public data = opt-in only

---

## 🐛 Common Issues

### "Trends not loading"
- Reddit/HN might be rate-limited
- Wait a few minutes and try again
- Local trends always work

### "Grammar check failed"
- LanguageTool free tier has limits
- Try shorter text
- Or try again later

### "Badge not appearing"
- Refresh page
- Check challenge requirements
- Go to `/challenges` to verify

### "Can't publish draft"
- Make sure draft has title/content
- Check Supabase connection
- Verify RLS policies are active

---

## 📱 Mobile Responsive

All features work on mobile:
- Tap hamburger menu (☰) in navbar
- All pages are mobile-optimized
- Touch-friendly buttons
- Responsive layouts

---

## 🎨 Customization

### Add Custom Challenges
Edit `/data/challenges.json`:
```json
{
  "id": "ch9",
  "title": "Your Challenge",
  "description": "Do something",
  "type": "creation",
  "goal": 25,
  "reward": "Custom Badge"
}
```

### Add Custom Prompts
Edit `/data/prompts.json`:
```json
{
  "id": "p16",
  "prompt": "Write about...",
  "category": "custom"
}
```

### Add Custom Badge Icons
Edit `/components/Badge.tsx` and add to `badges` object.

---

## 🚀 Next Steps

1. ✅ Run database migration
2. ✅ Start dev server
3. ✅ Create your first draft
4. ✅ Publish to community
5. ✅ Earn your first badge
6. ✅ Invite friends to join!

---

## 📚 Full Documentation

- **Feature Guide**: `COMMUNITY_FEATURES_GUIDE.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Database Schema**: `DATABASE_COMMUNITY_MIGRATION.sql`

---

## 💡 Tips

- **Daily Streak**: Create at least 1 draft per day
- **Community Star**: Publish quality content for upvotes
- **Analytics**: Create 10+ drafts for meaningful stats
- **Profile**: Set username in user_profiles table

---

**Ready to go!** 🎉

Run `npm run dev` and explore all the new features. Everything is free, privacy-focused, and built for the Supabase free tier.

Questions? Check the docs or open an issue.

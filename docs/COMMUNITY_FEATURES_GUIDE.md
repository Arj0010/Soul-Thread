# SoulThread Community Features Guide

## Overview
This guide covers all the new free, community-driven, and gamified features added to SoulThread.

## 🚀 New Features

### 1. Free Trend Feed (`/trends`)
- **Live Data Sources**:
  - Reddit (r/technology, r/Fitness)
  - Hacker News API
  - Local curated trends
- **Features**:
  - Filter by source
  - Copy trends to clipboard
  - Real-time fetching
  - No API keys required

### 2. Offline Voice Training (`/voice`)
- **Client-Side Analysis**:
  - Average sentence length calculation
  - Sentiment analysis (positive/negative/neutral)
  - Keyword extraction (top 5 words)
  - Complex word counting
- **Features**:
  - Auto-populate voice profile
  - Export Voice DNA as JSON
  - No external AI calls
  - Complete privacy

### 3. Smart Writing Tools (`/components/SmartTools.tsx`)
- **Headline Generator**: Template-based headline creation
- **Grammar Check**: Free LanguageTool API integration
- **Tone Adjuster**: Rule-based formal ↔ casual conversion
- **Features**:
  - No paid APIs
  - Copy or insert output
  - Real-time processing

### 4. Built-in Analytics (`/analytics`)
- **Metrics**:
  - Total drafts
  - Average word count
  - Most used words (top 10)
  - Drafts by month
  - Longest/shortest drafts
- **Features**:
  - Client-side computation
  - Bar chart visualizations
  - No backend overhead

### 5. Creator Community (`/community`)
- **Public Feed**:
  - Browse public drafts
  - Upvote system
  - Comment on drafts
  - Author profiles
- **My Drafts**:
  - Toggle public/private
  - Track upvotes
  - Manage visibility
- **Features**:
  - Row-level security
  - Real-time updates
  - Social engagement

### 6. User Profiles (`/profile/[id]`)
- **Display**:
  - Username and bio
  - Badge collection
  - Statistics (drafts, upvotes, streak)
  - Public drafts feed
- **Features**:
  - Customizable avatars
  - Badge showcase
  - Public portfolio

### 7. Challenges & Gamification (`/challenges`)
- **Challenge Types**:
  - Creation: Write X drafts
  - Streak: Maintain X-day streak
  - Social: Get X upvotes
- **Rewards**:
  - 8 unique badges
  - Automatic awarding
  - Progress tracking
- **Daily Features**:
  - Daily writing prompt (rotates from 15 prompts)
  - Quote of the day (ZenQuotes API)
  - Streak counter with fire emoji

### 8. Badge System (`/components/Badge.tsx`)
- **Available Badges**:
  - 🌱 Beginner Badge (1 draft)
  - ⚔️ Week Warrior Badge (7-day streak)
  - ✍️ Prolific Writer Badge (10 drafts)
  - ⭐ Community Star Badge (50 upvotes)
  - 🎤 Voice Master Badge (voice training)
  - 🔥 Consistent Creator Badge (30-day streak)
  - 🚀 Trendsetter Badge (5 public drafts)
  - 🏃 Marathon Badge (50 drafts)

## 📁 New File Structure

```
soulthread/
├── app/
│   ├── trends/page.tsx          # Trend feed with live APIs
│   ├── analytics/page.tsx       # Analytics dashboard
│   ├── community/page.tsx       # Community feed
│   ├── profile/[id]/page.tsx   # User profiles
│   └── challenges/page.tsx     # Gamification & challenges
├── components/
│   ├── SmartTools.tsx          # Writing tools
│   └── Badge.tsx               # Badge component
├── lib/
│   └── analyticsUtils.ts       # Analytics helpers
├── data/
│   ├── trends.json             # Local trend fallback
│   ├── challenges.json         # Challenge definitions
│   └── prompts.json            # Daily prompts
└── DATABASE_COMMUNITY_MIGRATION.sql
```

## 🗄️ Database Schema

### New Tables
1. **trends_cache**: Cache for external API trends
2. **user_stats**: Gamification (streak, badges, total_drafts, total_upvotes)
3. **comments**: Comments on public drafts
4. **draft_upvotes**: Upvote tracking
5. **user_profiles**: Public profile info (username, bio, avatar_url)

### Modified Tables
- **drafts**: Added `public` (boolean) and `upvotes` (integer)

## 🔧 Setup Instructions

### 1. Run Database Migration
```sql
-- Run DATABASE_COMMUNITY_MIGRATION.sql in Supabase SQL Editor
-- This will create all new tables and RLS policies
```

### 2. No Additional API Keys Required
All features use free APIs:
- Reddit JSON API (no auth)
- Hacker News API (public)
- LanguageTool free tier
- ZenQuotes API (free)

### 3. Start Development Server
```bash
cd soulthread
npm run dev
```

### 4. Test Features
1. Visit `/trends` - Fetch live trends
2. Visit `/voice` - Analyze writing sample
3. Visit `/community` - Publish a draft
4. Visit `/challenges` - Check daily prompt
5. Visit `/analytics` - View stats

## 🎮 Usage Guide

### Publishing to Community
1. Go to `/community`
2. Click "My Drafts" tab
3. Click "Publish" on any draft
4. Draft appears in public feed

### Earning Badges
1. Visit `/challenges`
2. Complete challenges automatically
3. Badges appear on profile
4. Share your profile link

### Using Smart Tools
1. Integrate `<SmartTools />` in any page
2. Tools available:
   - Headline Generator (local templates)
   - Grammar Check (LanguageTool API)
   - Tone Adjuster (rule-based)

### Tracking Analytics
1. Visit `/analytics`
2. All metrics computed client-side
3. Visualizations update automatically
4. Export coming soon

## 🆓 Free Tier Compatibility

All features designed for Supabase free tier:
- ✅ Under 500MB database
- ✅ No server-side compute (client-side analytics)
- ✅ Free external APIs only
- ✅ Efficient queries with indexes
- ✅ Row-level security

## 🔐 Security Features

- **RLS Policies**: All tables protected
- **User Scoping**: Users only access own data
- **Public Data**: Opt-in via `public` flag
- **No Sensitive Data**: No PII in public tables
- **Client-Side**: Voice analysis offline

## 🎨 Customization

### Adding New Badges
Edit `/data/challenges.json`:
```json
{
  "id": "ch9",
  "title": "New Challenge",
  "description": "Do something cool",
  "type": "creation",
  "goal": 100,
  "reward": "New Badge"
}
```

Update `/components/Badge.tsx` with new icon/color.

### Adding Daily Prompts
Edit `/data/prompts.json`:
```json
{
  "id": "p16",
  "prompt": "Your prompt here",
  "category": "category"
}
```

### Custom Trends
Edit `/data/trends.json` for local fallback trends.

## 🐛 Troubleshooting

### Trends Not Loading
- Check console for CORS errors
- Reddit/HN APIs might be rate-limited
- Use local fallback trends

### Grammar Check Fails
- LanguageTool free tier has limits
- Check network connection
- Try shorter text

### Badges Not Appearing
- Ensure user_stats table exists
- Check challenge completion criteria
- Refresh page

### Community Feed Empty
- No public drafts yet
- Publish your first draft
- Check RLS policies

## 📊 Performance Tips

1. **Analytics**: Limited to last 1000 drafts
2. **Trends Cache**: Auto-expires after 1 hour
3. **Community Feed**: Limited to 50 drafts
4. **Client-Side**: Heavy computation in browser

## 🚀 Future Enhancements

Possible additions (all free):
- Export analytics as PDF (browser print)
- Share drafts as images (html-to-canvas)
- RSS feed integration
- Markdown/HTML export
- Leaderboard system
- Achievement system

## 📝 Notes

- All features work offline except live trends
- No telemetry or tracking
- Privacy-first design
- Community moderation coming soon

---

**Ready to use!** Run `npm run dev` and explore all new features. Everything compiles and runs on Next.js 16 + Supabase free tier.

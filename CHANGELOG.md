# Changelog

All notable changes to SoulThread are documented in this file.

## [2.5.0] - 2025-11-05

### 🎉 Major Features Added

#### Template-Based Newsletter Generation
- **No OpenAI required!** Generate newsletters using smart templates
- Fast, free, works offline
- Uses voice profile for personalization
- Automatic greeting, sections, commentary, and closing
- Supports 3 tones: casual, professional, friendly
- New file: `lib/templateGenerate.ts`

#### LinkedIn Post Generator
- Generate professional LinkedIn posts with voice profile
- 6 post types: Professional, Thought Leadership, Story, Tips, Announcement, Engagement
- Character counter with LinkedIn limits
- Preview and best practices
- New files: `app/linkedin/page.tsx`, `app/api/linkedin-generate/route.ts`

### 🐛 Bug Fixes

#### Voice Profile Persistence
- Fixed "Voice Profile Not Found" error after saving
- Changed from `.single()` to `.limit(1)` queries to handle multiple rows
- Added comprehensive error handling and logging
- Created proper database schema with unique constraint
- New migration: `database-migrations/VOICEDNA_TABLE_MIGRATION.sql`

**Files Fixed:**
- `app/dashboard/page.tsx` - Voice profile loading
- `app/settings/page.tsx` - Voice profile save/load
- `app/api/ai-generate/route.ts` - Voice profile query
- `app/api/linkedin-generate/route.ts` - Voice profile query

#### Newsletter Generation Failures
- Added smart fallback system for news fetching
- Automatic fallback: Real-time → Trends → Mock data
- Better error handling with try-catch blocks
- Added logging to track news source counts
- Fixed empty newsletter issue

**Changes:**
- `app/api/ai-generate/route.ts` - Added fallback logic
- `lib/templateGenerate.ts` - Handles empty news items gracefully

#### Trends Page
- Fixed "Read more" links hanging on example.com URLs
- Now shows "Source unavailable" for placeholder URLs
- Real URLs open correctly in new tab

**File Fixed:**
- `app/trends/page.tsx` - Conditional link rendering

### ✨ UI/UX Improvements

#### Dashboard Redesign
- Modern gradient backgrounds
- Personalized time-based greeting
- 3 stat cards: Voice Status, Drafts Count, AI Status
- AI Content Suggestions with refresh button
- Personalized suggestions based on voice profile topics
- Quick Create section with 4 cards
- Right sidebar with voice warnings, quick links, tips

**File:** `app/dashboard/page.tsx` - Complete redesign

#### Navigation Reorganization
- Profile dropdown in top right (not cluttered navbar)
- Main nav: Dashboard, AI Newsletter, LinkedIn, Templates, Trends, Community, Analytics
- Profile dropdown: Profile Settings, Voice Trainer, My Drafts, Challenges, Sign Out
- Click outside to close dropdown
- User avatar with initials

**File:** `components/Navbar.tsx` - Reorganized structure

#### Settings Page
- 3 tabs: Voice Profile, Account, Preferences
- Left sidebar navigation
- Persistent voice status card showing current trained voice
- Shows last trained date, topics, tone, feeling
- Export/import voice DNA features

**File:** `app/settings/page.tsx` - New comprehensive settings

#### AI Newsletter Page
- Added "Generation Method" toggle
- Template (Fast, Free) ⚡ option
- AI Powered (Requires API) 🤖 option (when available)
- Disabled AI option when no API key configured
- Changed "Train Voice" to "Manage Voice" button

**File:** `app/ai-drafts/page.tsx` - Added generation method selection

### 📚 Documentation

#### New Documentation Files
- `docs/VOICE_PROFILE_FIX.md` - Complete fix documentation with code examples
- `docs/END_TO_END_TEST.md` - Comprehensive testing checklist
- `CHANGELOG.md` - This file!

#### Updated Documentation
- `README.md` - Added template mode features, updated quick start, added troubleshooting
- Updated database setup instructions
- Added "What Makes SoulThread Special" section
- Added "Known Issues & Solutions" section

### 🛠️ Technical Changes

#### Database
- Added `voicedna` table migration with proper schema
- Unique constraint on `user_id` to prevent duplicates
- Auto-updating `updated_at` trigger
- Row Level Security policies
- Indexes for efficient queries

**Migration:** `database-migrations/VOICEDNA_TABLE_MIGRATION.sql`

#### API Improvements
- Smart fallback system in `/api/ai-generate`
- Better error messages with details
- Comprehensive console logging
- Changed default model to `gpt-4o-mini`
- Added `useTemplate` parameter support

#### Code Quality
- Added TypeScript error handling with proper types
- Better React state management
- Improved error boundaries
- Console logging for debugging
- Proper cleanup in useEffect hooks

### 🔄 Breaking Changes

None! All changes are backward compatible.

### ⚡ Performance

- Template generation: < 1 second (vs 3-5 seconds with AI)
- Reduced API calls with smart caching
- Faster dashboard load with optimized queries
- Better error recovery with fallbacks

---

## [2.0.0] - 2025-11-03

### Features
- Community features (publish, upvote, comment)
- Challenges & badges system
- User profiles
- Analytics dashboard
- Writing tools (headline, grammar, tone)

### Database
- Added community tables
- Added gamification tables
- RLS policies for all tables

---

## [1.0.0] - 2025-10-28

### Initial Release
- Voice profile training
- AI newsletter generation
- Template system
- Trends feed
- Basic dashboard
- Authentication

---

## Version History

- **v2.5.0** (2025-11-05) - Template generation, voice profile fix, LinkedIn posts
- **v2.0.0** (2025-11-03) - Community features, gamification
- **v1.0.0** (2025-10-28) - Initial release

---

## Upgrade Guide

### From v2.0.0 to v2.5.0

1. **Run Database Migration:**
   ```sql
   -- Execute in Supabase SQL Editor
   -- File: database-migrations/VOICEDNA_TABLE_MIGRATION.sql
   ```

2. **Update Environment Variables (Optional):**
   ```bash
   # Add to .env.local if you want to use AI mode
   OPENAI_API_KEY=sk-your-key
   OPENAI_MODEL=gpt-4o-mini
   ```

3. **Pull Latest Code:**
   ```bash
   git pull origin main
   npm install
   npm run dev
   ```

4. **Test Voice Profile:**
   - Go to Settings → Voice Trainer
   - Save your voice profile
   - Verify Dashboard shows "Trained ✓"

5. **Test Newsletter Generation:**
   - Go to AI Newsletter
   - Select "Template (Fast, Free)"
   - Select "Mock Data"
   - Click "Generate Newsletter"
   - Verify newsletter generates with 8 items

That's it! No breaking changes.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

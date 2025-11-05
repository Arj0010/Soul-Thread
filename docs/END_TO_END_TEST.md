# SoulThread - End-to-End Testing Checklist

## Pre-Test Setup

### Database
- [ ] `voicedna` table exists with unique constraint on `user_id`
- [ ] `drafts` table exists
- [ ] All RLS policies are enabled
- [ ] Test user account created

### Environment
- [ ] `.env.local` file configured with Supabase credentials
- [ ] Development server running (`npm run dev`)
- [ ] Browser console open (F12) for debugging

---

## Test 1: User Authentication

### Login Flow
- [ ] Navigate to http://localhost:3001
- [ ] Click "Login" or "Sign Up"
- [ ] Enter test credentials
- [ ] **Expected:** Redirect to dashboard
- [ ] **Verify:** User email shows in profile dropdown (top right)

---

## Test 2: Voice Profile (Settings)

### Save Voice Profile
- [ ] Click profile icon → "Voice Trainer" (or Settings)
- [ ] Fill in form:
  - Topics: "AI, technology, startups"
  - Tone: "professional, conversational"
  - Feeling: "informed, optimistic"
- [ ] Click "Save Voice Profile"
- [ ] **Expected:** Success message appears
- [ ] **Expected:** Auto-redirect to dashboard after 1.5 seconds
- [ ] **Console:** "Voice profile saved successfully"

### Verify Voice Profile Loaded
- [ ] Navigate to Dashboard
- [ ] **Expected:** "Trained ✓" status shows (not "Not Set")
- [ ] **Expected:** AI suggestions show personalized topics
- [ ] **Console:** "Voice profile loaded successfully"
- [ ] **Console:** Shows voiceData.data with your topics/tone/feeling

### Optional: Writing Sample Analysis
- [ ] Go back to Settings → Voice Trainer
- [ ] Paste sample text (200+ words)
- [ ] Click "Analyze My Writing"
- [ ] **Expected:** Analysis shows avg sentence length, sentiment, keywords
- [ ] **Expected:** Form auto-fills based on analysis

---

## Test 3: Newsletter Generation (Template Mode)

### Generate with Mock Data
- [ ] Navigate to "AI Newsletter" from navbar
- [ ] Select settings:
  - Generation Method: **Template (Fast, Free) ⚡**
  - Data Source: **Mock Data**
  - Focus Topic: Leave as "All Topics"
- [ ] Click "Generate Newsletter"
- [ ] **Expected:** Button shows "Generating..."
- [ ] **Expected:** Newsletter appears in ~2 seconds
- [ ] **Expected:** Newsletter contains 8 news items from trends.json
- [ ] **Console:** "Using template-based generation"
- [ ] **Console:** "Final news items count: 8"

### Verify Newsletter Content
- [ ] Check newsletter has proper structure:
  - Greeting (matches your tone)
  - Introduction mentioning your topics
  - 8 sections with emojis (🔥, 💡, 🚀, etc.)
  - Commentary for each item
  - Executive Summary section
  - Call-to-action section
  - Closing signature
  - Footer with metadata

### Generate with Real-Time Data
- [ ] Change Data Source to **Real-time News**
- [ ] Click "Generate Newsletter"
- [ ] **Expected:** Fetches from Reddit/Hacker News/GitHub
- [ ] **Console:** "Fetching real-time news..."
- [ ] **Console:** "Fetched X news items from all sources"
- [ ] **Expected:** Newsletter has real news (or falls back to trends)

### Generate with Topic Filter
- [ ] Select Focus Topic: "AI"
- [ ] Keep Data Source: Mock Data
- [ ] Click "Generate Newsletter"
- [ ] **Expected:** Newsletter generated successfully
- [ ] Note: With mock data, filter may reduce items count

---

## Test 4: Save Newsletter Draft

### Save Generated Newsletter
- [ ] After generating newsletter, scroll down
- [ ] Click "Save Draft" button
- [ ] **Expected:** Success message
- [ ] **Console:** "Draft saved successfully"

### Verify Draft in Library
- [ ] Click profile icon → "My Drafts"
- [ ] **Expected:** Saved draft appears in list
- [ ] **Expected:** Shows date, title, word count
- [ ] Click on draft to view
- [ ] **Expected:** Full content loads

---

## Test 5: LinkedIn Post Generation

### Generate LinkedIn Post
- [ ] Navigate to "LinkedIn" from navbar
- [ ] Fill in form:
  - Topic: "AI trends"
  - Post Type: "Professional Insight"
- [ ] Click "Generate LinkedIn Post"
- [ ] **Expected:** Post generates within 2-3 seconds
- [ ] **Expected:** Post matches your voice tone
- [ ] **Console:** "Voice profile loaded" or "Using defaults"

### Verify Post Content
- [ ] Check character count updates
- [ ] Check post has professional structure
- [ ] Copy post to clipboard
- [ ] **Expected:** "Copied!" message shows

### Test Different Post Types
- [ ] Try "Thought Leadership" type
- [ ] Try "Personal Story" type
- [ ] **Expected:** Each generates different style

---

## Test 6: Dashboard Features

### Verify Dashboard Stats
- [ ] Navigate to Dashboard
- [ ] Check stats cards:
  - Voice: Shows "Trained ✓"
  - Drafts: Shows count (1 after saving)
  - AI Status: Shows "Ready"

### Test AI Suggestions
- [ ] Check AI Content Suggestions section
- [ ] **Expected:** 5 suggestions based on your topics
- [ ] Click "Refresh" button
- [ ] **Expected:** New suggestions generate
- [ ] Click on a suggestion
- [ ] **Expected:** Navigates to AI Newsletter with topic pre-filled

### Test Quick Create Cards
- [ ] Click "AI Newsletter" card
- [ ] **Expected:** Navigate to AI Newsletter page
- [ ] Go back, click "LinkedIn Post" card
- [ ] **Expected:** Navigate to LinkedIn page

---

## Test 7: Trends Page

### View Trends
- [ ] Navigate to "Trends" from navbar
- [ ] **Expected:** 15 curated trends display
- [ ] Check each trend has:
  - Title
  - Summary (200+ chars)
  - Source label
  - "Copy" button

### Test "Read More" Links
- [ ] Look for trends with real URLs (not example.com)
- [ ] Click "Read more →" link
- [ ] **Expected:** Opens in new tab
- [ ] For example.com URLs:
  - **Expected:** Shows "Source unavailable"

### Fetch Live Trends
- [ ] Click "Fetch Live Trends" button
- [ ] **Expected:** Button shows "Fetching..."
- [ ] **Expected:** New trends from Reddit/HN appear
- [ ] **Expected:** Filter buttons update with sources

### Test Copy Functionality
- [ ] Click "Copy" button on any trend
- [ ] **Expected:** Alert "Copied to clipboard!"
- [ ] Paste into text editor
- [ ] **Expected:** Markdown formatted text with title, summary, link

---

## Test 8: Settings & Profile

### Update Voice Profile
- [ ] Navigate to Settings
- [ ] Update tone to "casual, friendly"
- [ ] Click "Save Voice Profile"
- [ ] Go to Dashboard
- [ ] **Expected:** AI suggestions reflect new casual tone

### Test Navigation Tabs
- [ ] In Settings, click "Account" tab
- [ ] In Settings, click "Preferences" tab
- [ ] In Settings, click "Voice Profile" tab
- [ ] **Expected:** All tabs switch correctly

### Verify Existing Profile Shows
- [ ] On Voice Profile tab
- [ ] **Expected:** Green card shows "Your Voice is Trained"
- [ ] **Expected:** Shows last trained date
- [ ] **Expected:** Displays topics, tone, feeling

---

## Test 9: Error Handling

### Test Without Voice Profile
- [ ] Manually delete voice profile from Supabase
- [ ] Refresh Dashboard
- [ ] **Expected:** Warning shows "Set up your voice profile"
- [ ] **Expected:** Generates newsletter with default voice
- [ ] Re-save voice profile for next tests

### Test OpenAI Failure (if enabled)
- [ ] Temporarily break OPENAI_API_KEY in .env.local
- [ ] Restart dev server
- [ ] Generate newsletter with AI mode
- [ ] **Expected:** Automatic fallback to template
- [ ] **Console:** "OpenAI failed, falling back to template"

### Test Empty News Items
- [ ] Temporarily modify `fetchAllNewsSources` to return []
- [ ] Generate newsletter
- [ ] **Expected:** Falls back to trends.json
- [ ] **Console:** "No real-time news found, falling back"

---

## Test 10: Community Features (Optional)

### Publish Draft
- [ ] Go to My Drafts
- [ ] Select a draft
- [ ] Click "Make Public"
- [ ] Navigate to Community page
- [ ] **Expected:** Your draft appears in feed

### Upvote & Comment
- [ ] In Community, upvote a draft
- [ ] Add a comment
- [ ] **Expected:** Comment appears
- [ ] **Expected:** Upvote count increases

---

## Performance Tests

### Page Load Times
- [ ] Dashboard loads in < 2 seconds
- [ ] Settings loads in < 1 second
- [ ] AI Newsletter page loads in < 1 second

### Generation Times
- [ ] Template newsletter: < 1 second
- [ ] AI newsletter (if OpenAI enabled): < 5 seconds
- [ ] LinkedIn post: < 3 seconds

---

## Browser Console Checks

### No Errors
- [ ] No red errors in console (except expected 404s)
- [ ] No React hydration warnings
- [ ] No TypeScript errors

### Expected Logs
- [ ] "Voice profile loaded successfully"
- [ ] "Using template-based generation"
- [ ] "Final news items count: X"
- [ ] "Fetched X news items from all sources"

---

## Mobile Responsiveness (Optional)

### Test Mobile View
- [ ] Open DevTools → Toggle device toolbar
- [ ] Test on iPhone 12 viewport
- [ ] **Expected:** Navigation collapses to hamburger
- [ ] **Expected:** Cards stack vertically
- [ ] **Expected:** All features accessible

---

## Final Verification

### Database State
- [ ] Check `voicedna` table has 1 row for your user
- [ ] Check `drafts` table has your saved drafts
- [ ] No duplicate rows in any table

### Feature Completeness
- [ ] All navbar links work
- [ ] All profile dropdown items work
- [ ] All buttons respond correctly
- [ ] All forms submit successfully

---

## Test Summary

**Date:** ___________
**Tester:** ___________
**Environment:** Development / Production
**Overall Status:** Pass / Fail / Partial

**Issues Found:**
1. _________________
2. _________________
3. _________________

**Notes:**
_____________________
_____________________
_____________________

---

## Quick Test (5 Minutes)

For a quick smoke test, just verify these critical paths:

1. ✅ Login → Dashboard shows
2. ✅ Settings → Save voice profile → Dashboard shows "Trained ✓"
3. ✅ AI Newsletter → Template mode → Mock data → Generate → Newsletter appears with 8 items
4. ✅ Save draft → My Drafts shows saved item
5. ✅ LinkedIn → Generate post → Post appears

If all 5 pass, the app is working correctly! 🎉

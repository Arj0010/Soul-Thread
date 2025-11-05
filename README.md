# 🧵 SoulThread

**AI-Powered Newsletter Platform That Works 100% FREE**

Create personalized newsletters matching your unique writing style. Built with Next.js 16, React 19, TypeScript, and Supabase.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🚀 What Makes SoulThread Special?

### ⚡ Works Without External APIs
- **Template-Based Generation**: Fast, free newsletter creation (no OpenAI needed!)
- **Smart Fallbacks**: Automatic fallback system ensures content always generates
- **Zero Cost**: Generate unlimited newsletters for $0.00

### 🎯 Your Writing, Your Voice
- **Voice Profile Training**: AI analyzes your writing style (topics, tone, feeling)
- **Persistent Storage**: Your voice profile is saved and used across all features
- **Personalized Content**: Every newsletter matches YOUR unique style

### 🤖 Optional AI Enhancement
- **GPT-4 Integration**: Optional OpenAI integration for advanced generation
- **Graceful Degradation**: Automatically falls back to templates if API fails
- **No Vendor Lock-in**: Works perfectly with or without AI

---

## ✨ Features

### 🎨 Core Features
- **📝 Voice Profile Training** - Analyze your writing style automatically
- **⚡ Template-Based Generation** - Generate newsletters in <1 second, completely FREE
- **🤖 AI Newsletter Generation** - Optional GPT-4 powered content with voice matching
- **💼 LinkedIn Post Generator** - Create professional posts with your voice profile
- **📊 Trending Topics Feed** - Live data from Reddit, Hacker News & GitHub
- **🔄 Smart Fallbacks** - Never fails: Real-time → Curated → Mock data

### 🌍 Community Features
- **👥 Creator Community** - Publish, upvote, comment on newsletters
- **🏆 Challenges & Badges** - Gamification with 8 achievement badges
- **📈 Analytics Dashboard** - Track your writing metrics and progress
- **🎨 Public Profiles** - Showcase your best work

### ✏️ Writing Tools
- **Headline Generator** - AI-powered headline suggestions
- **Grammar Checker** - Real-time writing improvements
- **Tone Analyzer** - Ensure consistent voice across content
- **4 Newsletter Templates** - Tech Weekly, Business Brief, Casual Chat, Creative Spark

---

## 🎯 Use Cases

| User Type | Use SoulThread For |
|-----------|-------------------|
| 🎨 **Content Creators** | Generate weekly newsletters matching your style |
| 💼 **Marketing Teams** | Create consistent brand voice across campaigns |
| 📱 **Social Media Managers** | Generate LinkedIn posts with your company voice |
| 🎓 **Students** | Practice writing regularly and build portfolio |
| 🚀 **Startup Founders** | Send updates to investors without spending hours |
| 📝 **Bloggers** | Create newsletter versions of blog posts |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works!)
- Optional: OpenAI API key (for AI mode)

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/soulthread.git
cd soulthread

# Install dependencies
npm install
```

### 2️⃣ Environment Setup

Create `.env.local` in the root directory:

```env
# Required: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: OpenAI Configuration (for AI mode)
OPENAI_API_KEY=sk-your_openai_key
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_OPENAI_ENABLED=true

# Optional: News API (for additional news sources)
NEWS_API_KEY=your_newsapi_key
```

**Note:** App works fully without optional environment variables!

### 3️⃣ Database Setup

Run these SQL files in your Supabase SQL Editor **in this order**:

1. **Core Community Tables**
   ```sql
   -- File: database-migrations/DATABASE_COMMUNITY_MIGRATION.sql
   -- Creates: drafts, user_stats, user_profiles, comments, draft_upvotes, trends_cache
   ```

2. **Voice Profile Table** (IMPORTANT!)
   ```sql
   -- File: database-migrations/VOICEDNA_TABLE_MIGRATION.sql
   -- Creates: voicedna table with unique constraint
   ```

3. **Additional Tables** (Optional)
   ```sql
   -- File: database-migrations/DATABASE_SETUP.sql
   -- File: database-migrations/DATABASE_MIGRATION_V2.sql
   ```

### 4️⃣ Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5️⃣ First Steps

1. **Sign Up** - Create your account
2. **Train Voice** - Go to Settings → Voice Trainer → Paste writing sample
3. **Generate Newsletter** - AI Newsletter → Select "Template (Free)" → Generate!
4. **Save & Share** - Save your draft and publish to community

---

## 📁 Project Structure

```
soulthread/
├── app/                          # Next.js 16 App Router
│   ├── api/                      # API routes
│   │   ├── ai-generate/          # Newsletter generation with fallbacks
│   │   ├── linkedin-generate/    # LinkedIn post generation
│   │   ├── generate/             # Legacy endpoint
│   │   └── enhanced-generate/    # Enhanced endpoint
│   │
│   ├── ai-drafts/page.tsx        # Newsletter generation page
│   ├── analytics/page.tsx        # Writing metrics dashboard
│   ├── challenges/page.tsx       # Gamification challenges
│   ├── community/page.tsx        # Public drafts feed
│   ├── dashboard/page.tsx        # Main dashboard
│   ├── drafts-library/page.tsx   # User's saved drafts
│   ├── linkedin/page.tsx         # LinkedIn post generator
│   ├── settings/page.tsx         # Voice profile & settings
│   ├── templates/page.tsx        # Newsletter templates
│   ├── trends/page.tsx           # Trending topics feed
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/
│   ├── Navbar.tsx                # Navigation with profile dropdown
│   ├── Badge.tsx                 # Badge component
│   └── SmartTools.tsx            # Writing tools
│
├── lib/
│   ├── supabaseClient.ts         # Supabase configuration
│   ├── auth.ts                   # Authentication helpers
│   ├── openaiGenerate.ts         # OpenAI integration
│   ├── templateGenerate.ts       # Template generation (FREE)
│   ├── newsFetcher.ts            # News APIs with fallbacks
│   ├── templates.ts              # Template definitions
│   └── analyticsUtils.ts         # Analytics helpers
│
├── data/
│   ├── trends.json               # 15 curated trends (fallback data)
│   ├── challenges.json           # Gamification data
│   └── prompts.json              # AI prompts
│
├── database-migrations/
│   ├── DATABASE_COMMUNITY_MIGRATION.sql   # Community tables
│   ├── VOICEDNA_TABLE_MIGRATION.sql       # Voice profile schema
│   ├── DATABASE_SETUP.sql                 # Initial setup
│   └── DATABASE_MIGRATION_V2.sql          # V2 migration
│
├── docs/
│   ├── QUICK_START.md            # 5-minute setup guide
│   ├── VOICE_PROFILE_FIX.md      # Voice profile fix documentation
│   ├── END_TO_END_TEST.md        # Complete testing checklist
│   ├── COMMUNITY_FEATURES_GUIDE.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── TESTING_GUIDE.md
│
├── public/                       # Static assets
├── .env.local                    # Environment variables (create this)
├── .gitignore                    # Git ignore rules
├── CHANGELOG.md                  # Version history
├── LINKEDIN_POST.md              # Launch announcement templates
├── PROJECT_SUMMARY.md            # Complete project overview
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
└── README.md                     # This file
```

---

## 🔧 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 3.x
- **State**: React Hooks (useState, useEffect)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API Routes**: Next.js API Routes
- **Security**: Row Level Security (RLS)

### AI & APIs
- **AI**: OpenAI GPT-4 (optional)
- **News**: Reddit, Hacker News, GitHub APIs
- **Grammar**: LanguageTool API
- **Quotes**: ZenQuotes API

### Deployment
- **Hosting**: Vercel (recommended)
- **Database**: Supabase Cloud
- **CI/CD**: GitHub Actions (optional)

---

## 🎨 Key Features Explained

### 1. Template-Based Generation (FREE Mode)

**How it works:**
1. Uses your voice profile (topics, tone, feeling)
2. Fetches trending news (or uses curated trends)
3. Generates newsletter using smart templates
4. Adds personalized commentary based on your tone
5. Creates professional structure with sections

**Benefits:**
- ⚡ Generates in <1 second
- 💰 Costs $0.00 (no API needed)
- 🎯 Matches your writing style
- 🔄 Never fails (uses fallbacks)

**Example Output:**
```markdown
# 📰 AI-Powered Personal Training Apps Reach 50M Users

Good day,

Welcome to this edition of your technology newsletter...

## 🔥 AI-Powered Personal Training Apps Reach 50M Users
The fitness technology sector is experiencing unprecedented growth...

## 💡 Next-Gen Wearables Transform Healthcare
Innovative wearable devices are revolutionizing patient monitoring...

[... 6 more sections ...]

---
Best regards,
Your Newsletter Team
```

### 2. Voice Profile System

**What is Voice Profile?**
Your voice profile is a JSON object stored in the database containing:
- **Topics**: Your areas of interest (e.g., "AI, technology, startups")
- **Tone**: Your writing style (e.g., "professional, conversational")
- **Feeling**: How you want readers to feel (e.g., "informed, optimistic")
- **Analysis**: Optional writing sample analysis (sentence length, sentiment, keywords)

**Database Schema:**
```sql
CREATE TABLE voicedna (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,  -- Prevents duplicates
  data JSONB NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**How to Train Your Voice:**
1. Go to Settings → Voice Trainer
2. Option A: Fill in the form manually
3. Option B: Paste writing sample (200+ words) → Click "Analyze"
4. Save Voice Profile
5. Verify on Dashboard: Shows "Trained ✓"

### 3. Smart Fallback System

**Fallback Chain for Content:**
```
1. Try Real-time News APIs (Reddit, HN, GitHub)
   ↓ (fails or empty)
2. Use Curated Trends (data/trends.json - 15 items)
   ↓ (fails)
3. Use Mock Data (minimal 3 items)
   ↓
Result: Content ALWAYS generates
```

**Fallback Chain for Generation:**
```
1. Try OpenAI GPT-4 (if API key configured)
   ↓ (quota exceeded or error)
2. Use Template Generation (FREE)
   ↓
Result: Newsletter ALWAYS generates
```

### 4. LinkedIn Post Generator

Generate professional LinkedIn posts with your voice profile.

**6 Post Types:**
- **Professional Insight**: Industry analysis and expertise
- **Thought Leadership**: Share unique perspectives
- **Personal Story**: Engaging narratives
- **Tips & Advice**: Actionable how-to content
- **Announcement**: Product launches, updates
- **Engagement**: Questions and discussions

**Features:**
- Character counter (3000 char LinkedIn limit)
- Real-time news context integration
- Voice profile tone matching
- One-click copy to clipboard
- Best practices sidebar

---

## 🧪 Testing

### Quick Test (5 Minutes)

Run this checklist to verify everything works:

1. ✅ **Login** → Dashboard shows
2. ✅ **Settings** → Save voice profile → Dashboard shows "Trained ✓"
3. ✅ **AI Newsletter** → Template mode → Mock data → Generate → Newsletter appears with 8 items
4. ✅ **Save Draft** → My Drafts shows saved item
5. ✅ **LinkedIn** → Generate post → Post appears

If all 5 pass, you're good to go! 🎉

### Full Testing

See [END_TO_END_TEST.md](docs/END_TO_END_TEST.md) for comprehensive testing checklist.

### Build & Run Tests

```bash
# Build test
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SoulThread v2.5.0"
   git branch -M main
   git remote add origin https://github.com/yourusername/soulthread.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Deploy!

3. **Environment Variables (Vercel)**

   **Required:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **Optional:**
   ```
   OPENAI_API_KEY=sk-your_key
   OPENAI_MODEL=gpt-4o-mini
   NEXT_PUBLIC_OPENAI_ENABLED=true
   NEWS_API_KEY=your_newsapi_key
   ```

4. **Done!** Your app is live at `https://your-project.vercel.app`

### Other Deployment Options

**Netlify:**
```bash
npm run build
# Deploy .next folder with Next.js runtime
```

**Railway:**
```bash
# Connect GitHub repo
# Add environment variables
# Auto-deploys on push
```

**Self-Hosted:**
```bash
npm run build
npm start
# Use PM2 or similar for process management
```

---

## 📊 Performance Metrics

| Operation | Time | Cost | Notes |
|-----------|------|------|-------|
| Template Generation | <1 sec | $0.00 | Default mode |
| AI Generation (GPT-4) | 3-5 sec | ~$0.01 | Optional |
| Voice Profile Load | <100ms | $0.00 | Cached |
| Dashboard Load | <2 sec | $0.00 | Optimized queries |
| News Fetch (Real-time) | 2-3 sec | $0.00 | With fallbacks |

**Total Cost Per Newsletter:**
- **Template Mode**: $0.00 (FREE forever)
- **AI Mode**: ~$0.01 (if OpenAI configured)

---

## 🔐 Security

### Implemented Security Features
✅ Row Level Security (RLS) on all database tables
✅ User-scoped data access policies
✅ Secure API routes with authentication
✅ Environment variable protection
✅ HTTPS only (enforced by Vercel)
✅ XSS protection (React sanitization)
✅ CSRF protection (Next.js built-in)

### Best Practices
- Never commit `.env.local` to Git (protected by .gitignore)
- Rotate API keys regularly
- Use Supabase RLS policies for all tables
- Validate all user inputs
- Sanitize database queries

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | This file - main documentation |
| [QUICK_START.md](docs/QUICK_START.md) | 5-minute setup guide |
| [VOICE_PROFILE_FIX.md](docs/VOICE_PROFILE_FIX.md) | Voice profile troubleshooting |
| [END_TO_END_TEST.md](docs/END_TO_END_TEST.md) | Complete testing checklist |
| [CHANGELOG.md](CHANGELOG.md) | Version history & updates |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Complete project overview (15,000+ words) |
| [LINKEDIN_POST.md](LINKEDIN_POST.md) | Launch announcement templates |

---

## 🐛 Troubleshooting

### Voice Profile Not Showing?

**Problem:** Dashboard shows "Not Set" even after saving

**Solution:**
1. Run `database-migrations/VOICEDNA_TABLE_MIGRATION.sql` in Supabase
2. Check browser console for errors
3. Verify database has `voicedna` table with `UNIQUE(user_id)` constraint
4. See [VOICE_PROFILE_FIX.md](docs/VOICE_PROFILE_FIX.md) for detailed fix

### Newsletter Generation Failing?

**Problem:** Error or empty newsletter

**Solution:**
1. Switch to "Template (Fast, Free)" mode
2. Select "Mock Data" as data source
3. System automatically falls back to templates
4. Check browser console for specific errors

### OpenAI Quota Exceeded?

**Problem:** 429 error from OpenAI

**Solution:**
1. Use Template mode instead (works great, completely free!)
2. Or add credits at [platform.openai.com](https://platform.openai.com)
3. Or get new API key with free credits

### Database Connection Issues?

**Problem:** Can't connect to Supabase

**Solution:**
1. Verify `.env.local` has correct credentials
2. Check Supabase project is active
3. Verify RLS policies allow access
4. Check browser network tab for specific errors

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/yourusername/soulthread
   cd soulthread
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes**
   - Write clean, typed TypeScript code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Commit your changes**
   ```bash
   git commit -m "Add AmazingFeature: description of what it does"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**
   - Go to original repository
   - Click "New Pull Request"
   - Describe your changes
   - Link any related issues

### Code Style Guidelines
- Use TypeScript for all new code
- Follow ESLint rules (`npm run lint`)
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📈 Roadmap

### ✅ Completed (v2.5.0)
- Template-based generation (FREE mode)
- Voice profile persistence fix
- Smart fallback system
- LinkedIn post generator
- Dashboard redesign
- Navigation reorganization
- Comprehensive documentation

### 🚧 In Progress
- Email sending integration
- Schedule newsletter automation
- Advanced analytics
- Team collaboration features

### 📋 Planned
- Mobile app (React Native)
- Browser extension
- WordPress plugin
- API for third-party integrations
- White-label solution
- Multi-language support

---

## 🎉 What's New in v2.5.0

### Major Features
- ⚡ **Template-Based Generation** - Generate newsletters for FREE without OpenAI
- 🎯 **Voice Profile Fix** - Persistent voice profiles with proper database schema
- 🔄 **Smart Fallbacks** - Automatic fallback to curated trends when APIs fail
- 💼 **LinkedIn Posts** - Generate professional posts with voice profile integration
- 🎨 **Dashboard Redesign** - Modern UI with AI suggestions and stats

### Bug Fixes
- Fixed voice profile not persisting after save
- Fixed newsletter generation with empty news items
- Fixed trends page "Read more" links
- Fixed duplicate voice profile rows issue
- Better error handling throughout app

See [CHANGELOG.md](CHANGELOG.md) for complete details.

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

This means you can:
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Private use

---

## 🙏 Acknowledgments

### Built With
- [Next.js](https://nextjs.org/) - The React framework
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Supabase](https://supabase.com/) - Backend platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [OpenAI](https://openai.com/) - AI integration (optional)
- [Vercel](https://vercel.com/) - Hosting

### Inspired By
- Newsletter platforms: Substack, beehiiv
- AI tools: ChatGPT, Claude
- Community platforms: Reddit, Hacker News

---

## 📞 Support & Community

### Get Help
- 📖 **Documentation**: Start with [QUICK_START.md](docs/QUICK_START.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/soulthread/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/soulthread/discussions)

### Stay Updated
- ⭐ **Star this repo** to get updates
- 👀 **Watch releases** for new versions
- 🐦 **Follow on Twitter**: [@yourhandle](https://twitter.com/yourhandle)
- 💼 **LinkedIn**: [Your Profile](https://linkedin.com/in/yourprofile)

---

## 📊 Project Stats

- **Version**: 2.5.0
- **Lines of Code**: ~15,000
- **Files**: 50+
- **Components**: 20+
- **API Routes**: 5
- **Database Tables**: 7
- **Documentation Pages**: 8
- **License**: MIT
- **Status**: Production Ready ✅

---

## 🎯 Quick Links

- [Live Demo](https://soulthread.vercel.app) (coming soon)
- [Documentation](docs/)
- [API Reference](docs/IMPLEMENTATION_SUMMARY.md)
- [Changelog](CHANGELOG.md)
- [Contributing Guidelines](#-contributing)
- [Issue Tracker](https://github.com/yourusername/soulthread/issues)

---

<div align="center">

**Built with ❤️ using free, open technologies**

Made by [Arjun](https://github.com/yourusername) | [Star this repo ⭐](https://github.com/yourusername/soulthread)

*Version 2.5.0 | Last Updated: November 5, 2025*

</div>

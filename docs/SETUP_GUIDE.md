# 🚀 SoulThread Setup Guide

## ✅ **Quick Setup (3 Steps)**

### **Step 1: Database Setup**
1. Go to your **Supabase Dashboard**
2. Click **SQL Editor** (left sidebar)
3. Copy and paste this SQL code:

```sql
-- Enhanced drafts table
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing drafts
UPDATE drafts 
SET title = 'Untitled Draft', 
    status = 'draft',
    updated_at = created_at
WHERE title IS NULL OR status IS NULL;
```

4. Click **Run** ✅

### **Step 2: Environment Variables**
Add these to your `.env.local` file:

```env
# Your existing Supabase keys
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# OpenAI (you already added this ✅)
OPENAI_API_KEY=sk-your_openai_key

# Enable AI features
NEXT_PUBLIC_OPENAI_ENABLED=true
```

### **Step 3: Start the App**
```bash
npm run dev
```

## 🎯 **How to Use SoulThread**

### **1. Set Up Your Voice** 
- Go to **Voice Trainer**
- Fill out your writing style (topics, tone, feeling)
- Click **Save Voice Profile**

### **2. Create AI Newsletter**
- Go to **AI Newsletter** 
- Choose data source (Real-time or Mock)
- Select a topic (optional)
- Click **Generate Newsletter**
- Watch AI create your personalized newsletter!

### **3. Use Templates**
- Go to **Templates**
- Choose a template (Tech, Business, Casual, Creative)
- Fill in the sections
- Click **Generate Newsletter**

### **4. Manage Drafts**
- Go to **My Drafts**
- View, edit, delete your saved newsletters
- Search and filter your drafts

## 🔧 **Troubleshooting**

### **AI Not Working?**
- Check if `OPENAI_API_KEY` is in `.env.local`
- Check if `NEXT_PUBLIC_OPENAI_ENABLED=true`
- Restart the app: `npm run dev`

### **Database Errors?**
- Make sure you ran the SQL commands in Supabase
- Check your Supabase URL and key in `.env.local`

### **Can't Save Drafts?**
- Make sure you're logged in
- Check if the database tables exist in Supabase

## 📱 **Available Pages**

- **Dashboard** - Overview and quick stats
- **Voice Trainer** - Set up your writing style
- **AI Newsletter** - Generate with AI + real-time data
- **Templates** - Use pre-made newsletter templates
- **My Drafts** - Manage your saved newsletters

## 🎉 **You're Ready!**

SoulThread will now generate personalized newsletters using:
- ✅ Your voice profile (tone, topics, style)
- ✅ Real-time news data (News API, Reddit, GitHub)
- ✅ AI-powered content generation (GPT-4)
- ✅ Professional templates
- ✅ Draft management

**Start by setting up your voice profile, then try generating your first AI newsletter!** 🚀


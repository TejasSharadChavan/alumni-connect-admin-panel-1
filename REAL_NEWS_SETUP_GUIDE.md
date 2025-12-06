# 📰 Real News Integration Setup Guide

## Get Live, Up-to-Date Industry News

This guide will help you configure real news sources to replace sample data with actual, daily-updated tech news.

---

## 🚀 Quick Start (Free Options)

### Option 1: NewsAPI.org (Recommended - 100 Free Requests/Day)

1. **Sign up for free:** https://newsapi.org/register
2. **Get your API key** from the dashboard
3. **Add to `.env` file:**
   ```env
   NEWSAPI_KEY=your_api_key_here
   ```
4. **Restart your server:** `bun run dev`
5. **Done!** News will update every 6 hours automatically

### Option 2: RSS Feeds (Completely Free - No API Key Needed)

RSS feeds are already configured! They work out of the box:

- TechCrunch: https://techcrunch.com/feed/
- The Verge: https://www.theverge.com/rss/index.xml
- Dev.to: https://dev.to/feed

No setup required - just works! 🎉

---

## 🤖 AI Enhancement (Optional but Recommended)

Add AI to automatically categorize and enhance news articles:

### Option A: OpenAI (GPT-3.5/GPT-4)

1. **Sign up:** https://platform.openai.com/
2. **Get API key:** https://platform.openai.com/api-keys
3. **Add to `.env`:**
   ```env
   OPENAI_API_KEY=sk-your_key_here
   ```
4. **Cost:** ~$0.002 per article (very cheap)

### Option B: Google Gemini (Free Tier Available)

1. **Sign up:** https://makersuite.google.com/
2. **Get API key** from Google AI Studio
3. **Add to `.env`:**
   ```env
   GEMINI_API_KEY=your_key_here
   ```
4. **Cost:** Free tier available

### Option C: Anthropic Claude

1. **Sign up:** https://console.anthropic.com/
2. **Get API key**
3. **Add to `.env`:**
   ```env
   ANTHROPIC_API_KEY=your_key_here
   ```
4. **Cost:** Pay as you go

---

## 📋 Complete .env Configuration

Create or update your `.env` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# News API (Choose one or use multiple)
NEWSAPI_KEY=your_newsapi_key_here

# AI Services (Optional - Choose one)
OPENAI_API_KEY=sk-your_openai_key_here
# OR
GEMINI_API_KEY=your_gemini_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_key_here

# Cache settings (Optional)
NEWS_CACHE_DURATION_HOURS=6
```

---

## 🔄 How It Works

### News Aggregation Flow

```
1. User visits Industry Trends page
   ↓
2. API checks cache (6-hour expiry)
   ↓
3. If expired, fetch from sources:
   - NewsAPI (if configured)
   - RSS Feeds (TechCrunch, The Verge, Dev.to)
   - Google News (if configured)
   ↓
4. Combine & deduplicate articles
   ↓
5. AI Enhancement (if configured):
   - Categorize articles
   - Extract relevant tags
   - Calculate relevance scores
   ↓
6. Cache results for 6 hours
   ↓
7. Return to user
```

### Update Frequency

- **With API keys:** News updates every 6 hours automatically
- **Without API keys:** Shows setup instructions
- **Manual refresh:** Clear cache by restarting server

---

## 📊 News Sources Comparison

| Source             | Cost       | Articles/Day | Quality   | Setup Time       |
| ------------------ | ---------- | ------------ | --------- | ---------------- |
| **RSS Feeds**      | Free       | ~30          | High      | 0 min (built-in) |
| **NewsAPI**        | Free       | 100          | Very High | 2 min            |
| **Google News**    | Free       | Unlimited    | High      | 5 min            |
| **AI Enhancement** | ~$0.10/day | N/A          | Excellent | 3 min            |

---

## 🎯 Recommended Setup

### For Development/Testing

```env
# Just use RSS feeds (already working)
# No configuration needed!
```

### For Production (Best Experience)

```env
NEWSAPI_KEY=your_key_here
OPENAI_API_KEY=sk-your_key_here
```

This gives you:

- ✅ 100+ fresh articles daily
- ✅ AI-powered categorization
- ✅ Intelligent tagging
- ✅ Relevance scoring
- ✅ Trending detection

**Cost:** ~$3-5/month (very affordable)

---

## 🧪 Testing Your Setup

### 1. Check if News is Loading

```bash
# Start your server
bun run dev

# Check the console logs
# You should see:
# "Fetching real-time industry news..."
# "Fetched X articles from multiple sources"
```

### 2. Verify in Browser

1. Login as student or alumni
2. Click "Industry Trends" (✨ icon)
3. Check the footer - should say "Source: live" (not "fallback")
4. Articles should have real dates (today/yesterday)
5. Click "Read More" - should open actual article

### 3. Test Search

- Search for "AI" - should return AI-related articles
- Search for "React" - should return React articles
- Search for "Jobs" - should return career articles

---

## 🔧 Troubleshooting

### Issue: Still seeing "Configure News APIs" message

**Solution:**

1. Check `.env` file exists in project root
2. Verify API key is correct (no extra spaces)
3. Restart server: `Ctrl+C` then `bun run dev`
4. Check console for error messages

### Issue: "Failed to fetch trends" error

**Solution:**

1. Check internet connection
2. Verify API key is valid (not expired)
3. Check API rate limits (NewsAPI: 100/day on free tier)
4. Look at console logs for specific error

### Issue: Old news showing

**Solution:**

1. Cache is 6 hours - wait or restart server
2. Clear cache by restarting: `Ctrl+C` then `bun run dev`
3. Check if API key has reached rate limit

### Issue: AI categorization not working

**Solution:**

1. Verify AI API key is correct
2. Check API credits/balance
3. Look for AI-specific errors in console
4. Try different AI service (OpenAI/Gemini/Claude)

---

## 📈 Monitoring & Optimization

### Check News Freshness

Console logs show:

```
Fetching fresh news from multiple sources...
Fetched 45 articles from multiple sources
```

### Monitor API Usage

- **NewsAPI:** Check dashboard at https://newsapi.org/account
- **OpenAI:** Check usage at https://platform.openai.com/usage
- **Gemini:** Check quota at Google AI Studio

### Optimize Costs

1. **Increase cache duration** (default: 6 hours)

   ```env
   NEWS_CACHE_DURATION_HOURS=12
   ```

2. **Limit AI processing** (only process first 10 articles)
   - Already implemented in code

3. **Use RSS only** (completely free)
   - Just don't add API keys

---

## 🌟 Advanced Configuration

### Custom RSS Feeds

Edit `src/lib/news-aggregator.ts`:

```typescript
const feeds = [
  "https://techcrunch.com/feed/",
  "https://www.theverge.com/rss/index.xml",
  "https://dev.to/feed",
  "https://your-custom-feed.com/rss", // Add your own
];
```

### Adjust Cache Duration

In `.env`:

```env
NEWS_CACHE_DURATION_HOURS=12  # Update every 12 hours
```

### Filter by Topics

Edit NewsAPI query in `src/lib/news-aggregator.ts`:

```typescript
const topics = [
  "artificial intelligence",
  "machine learning",
  "your custom topic", // Add your topics
];
```

---

## 📚 API Documentation

### NewsAPI

- **Docs:** https://newsapi.org/docs
- **Endpoints:** Everything, Top Headlines, Sources
- **Rate Limit:** 100 requests/day (free), 1000/day (paid)
- **Cost:** Free tier available, $449/month for unlimited

### OpenAI

- **Docs:** https://platform.openai.com/docs
- **Models:** GPT-3.5-turbo ($0.002/1K tokens), GPT-4 ($0.03/1K tokens)
- **Rate Limit:** 3 requests/min (free), higher for paid

### Google Gemini

- **Docs:** https://ai.google.dev/docs
- **Models:** Gemini Pro (free tier available)
- **Rate Limit:** 60 requests/min (free)

### Anthropic Claude

- **Docs:** https://docs.anthropic.com/
- **Models:** Claude 3 Haiku, Sonnet, Opus
- **Rate Limit:** Based on tier

---

## ✅ Verification Checklist

- [ ] `.env` file created with API keys
- [ ] Server restarted after adding keys
- [ ] Console shows "Fetching real-time industry news..."
- [ ] Articles have today's/yesterday's dates
- [ ] "Read More" links work
- [ ] Search functionality works
- [ ] Categories filter correctly
- [ ] Trending topics appear
- [ ] No "Configure APIs" message
- [ ] Footer shows "Source: live"

---

## 🎉 Success!

Once configured, you'll have:

✅ **Real, up-to-date tech news** (not sample data)
✅ **Daily automatic updates** (every 6 hours)
✅ **AI-powered categorization** (if AI configured)
✅ **Intelligent search** (relevance-based)
✅ **Trending detection** (last 24 hours)
✅ **Multiple sources** (NewsAPI + RSS feeds)
✅ **Professional experience** (like real news apps)

---

## 💡 Pro Tips

1. **Start with RSS feeds** (free, works immediately)
2. **Add NewsAPI** when you need more articles
3. **Add AI** for best categorization
4. **Monitor usage** to avoid rate limits
5. **Increase cache** to reduce API calls
6. **Use multiple sources** for redundancy

---

## 🆘 Need Help?

1. Check console logs for errors
2. Verify API keys are correct
3. Test each service individually
4. Check API service status pages
5. Review rate limits and quotas

---

**Ready to get started? Add your API keys to `.env` and restart the server!** 🚀

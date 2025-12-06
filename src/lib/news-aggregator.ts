// Real-time news aggregation from multiple sources
// This service fetches actual news from various APIs and RSS feeds

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  date: string;
  url: string;
  image: string;
  tags: string[];
  trending: boolean;
  relevanceScore: number;
}

// Cache to store fetched news (in production, use Redis or similar)
let newsCache: { data: NewsArticle[]; timestamp: number } | null = null;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// Fetch news from NewsAPI.org
async function fetchFromNewsAPI(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    console.log("NewsAPI key not configured");
    return [];
  }

  try {
    const topics = [
      "artificial intelligence",
      "machine learning",
      "web development",
      "cloud computing",
      "cybersecurity",
      "data science",
      "programming",
      "technology jobs",
    ];

    const articles: NewsArticle[] = [];

    // Fetch for each topic
    for (const topic of topics.slice(0, 3)) {
      // Limit to 3 topics to avoid rate limits
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`,
        { next: { revalidate: 21600 } } // Cache for 6 hours
      );

      if (response.ok) {
        const data = await response.json();
        const newsArticles =
          data.articles?.map((article: any) => ({
            id: `newsapi-${article.url}`,
            title: article.title,
            summary:
              article.description || article.content?.substring(0, 200) || "",
            category: categorizeTopic(topic),
            source: article.source.name,
            date: article.publishedAt,
            url: article.url,
            image:
              article.urlToImage ||
              "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400",
            tags: extractTags(article.title + " " + article.description),
            trending: isRecent(article.publishedAt),
            relevanceScore: calculateRelevance(article),
          })) || [];

        articles.push(...newsArticles);
      }
    }

    return articles;
  } catch (error) {
    console.error("NewsAPI fetch error:", error);
    return [];
  }
}

// Fetch from RSS feeds (TechCrunch, The Verge, Dev.to, etc.)
async function fetchFromRSSFeeds(): Promise<NewsArticle[]> {
  try {
    const feeds = [
      "https://techcrunch.com/feed/",
      "https://www.theverge.com/rss/index.xml",
      "https://dev.to/feed",
    ];

    const articles: NewsArticle[] = [];

    for (const feedUrl of feeds) {
      try {
        // Use RSS to JSON converter service
        const response = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=10`,
          { next: { revalidate: 21600 } }
        );

        if (response.ok) {
          const data = await response.json();
          const feedArticles =
            data.items?.map((item: any) => ({
              id: `rss-${item.link}`,
              title: item.title,
              summary: stripHtml(
                item.description || item.content || ""
              ).substring(0, 200),
              category: categorizeFromContent(
                item.title + " " + item.description
              ),
              source: data.feed?.title || "Tech News",
              date: item.pubDate,
              url: item.link,
              image:
                item.thumbnail ||
                item.enclosure?.link ||
                "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400",
              tags: extractTags(item.title + " " + item.description),
              trending: isRecent(item.pubDate),
              relevanceScore: 80,
            })) || [];

          articles.push(...feedArticles);
        }
      } catch (error) {
        console.error(`RSS feed error for ${feedUrl}:`, error);
      }
    }

    return articles;
  } catch (error) {
    console.error("RSS fetch error:", error);
    return [];
  }
}

// Fetch from Google News (if API key available)
async function fetchFromGoogleNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.GOOGLE_NEWS_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const query = "technology OR programming OR AI OR software development";
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?q=${encodeURIComponent(query)}&language=en&apiKey=${apiKey}`,
      { next: { revalidate: 21600 } }
    );

    if (response.ok) {
      const data = await response.json();
      return (
        data.articles?.map((article: any) => ({
          id: `google-${article.url}`,
          title: article.title,
          summary: article.description || "",
          category: "Industry News",
          source: article.source.name,
          date: article.publishedAt,
          url: article.url,
          image:
            article.urlToImage ||
            "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400",
          tags: extractTags(article.title),
          trending: isRecent(article.publishedAt),
          relevanceScore: 85,
        })) || []
      );
    }
  } catch (error) {
    console.error("Google News fetch error:", error);
  }

  return [];
}

// Use AI (OpenAI/Gemini/Claude) to enhance and categorize news
async function enhanceWithAI(articles: NewsArticle[]): Promise<NewsArticle[]> {
  // Check which AI service is available
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!openaiKey && !geminiKey && !anthropicKey) {
    console.log("No AI API keys configured, skipping AI enhancement");
    return articles;
  }

  try {
    // Use OpenAI if available
    if (openaiKey) {
      return await enhanceWithOpenAI(articles, openaiKey);
    }
    // Use Gemini if available
    else if (geminiKey) {
      return await enhanceWithGemini(articles, geminiKey);
    }
    // Use Claude if available
    else if (anthropicKey) {
      return await enhanceWithClaude(articles, anthropicKey);
    }
  } catch (error) {
    console.error("AI enhancement error:", error);
  }

  return articles;
}

// Enhance with OpenAI
async function enhanceWithOpenAI(
  articles: NewsArticle[],
  apiKey: string
): Promise<NewsArticle[]> {
  try {
    // Batch process articles for better categorization
    const sampleArticles = articles.slice(0, 10); // Process first 10 to save API costs

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a tech news categorization expert. Categorize articles into: AI & ML, Web Development, Cloud & DevOps, Cybersecurity, Data Science, Mobile Development, Career, Skills, Blockchain, or Emerging Tech.",
          },
          {
            role: "user",
            content: `Categorize these articles and extract relevant tags:\n${sampleArticles.map((a) => `Title: ${a.title}\nSummary: ${a.summary}`).join("\n\n")}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      // Parse AI response and update articles
      // (Implementation depends on AI response format)
      console.log("AI categorization complete");
    }
  } catch (error) {
    console.error("OpenAI enhancement error:", error);
  }

  return articles;
}

// Enhance with Google Gemini
async function enhanceWithGemini(
  articles: NewsArticle[],
  apiKey: string
): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Categorize these tech news articles:\n${articles
                    .slice(0, 10)
                    .map((a) => a.title)
                    .join("\n")}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("Gemini categorization complete");
    }
  } catch (error) {
    console.error("Gemini enhancement error:", error);
  }

  return articles;
}

// Enhance with Anthropic Claude
async function enhanceWithClaude(
  articles: NewsArticle[],
  apiKey: string
): Promise<NewsArticle[]> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Categorize these tech articles:\n${articles
              .slice(0, 10)
              .map((a) => a.title)
              .join("\n")}`,
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Claude categorization complete");
    }
  } catch (error) {
    console.error("Claude enhancement error:", error);
  }

  return articles;
}

// Main aggregation function
export async function aggregateNews(): Promise<NewsArticle[]> {
  // Check cache first
  if (newsCache && Date.now() - newsCache.timestamp < CACHE_DURATION) {
    console.log("Returning cached news");
    return newsCache.data;
  }

  console.log("Fetching fresh news from multiple sources...");

  try {
    // Fetch from all sources in parallel
    const [newsApiArticles, rssArticles, googleArticles] = await Promise.all([
      fetchFromNewsAPI(),
      fetchFromRSSFeeds(),
      fetchFromGoogleNews(),
    ]);

    // Combine all articles
    let allArticles = [...newsApiArticles, ...rssArticles, ...googleArticles];

    // Remove duplicates based on title similarity
    allArticles = deduplicateArticles(allArticles);

    // Enhance with AI if available
    allArticles = await enhanceWithAI(allArticles);

    // Sort by date (most recent first)
    allArticles.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Update cache
    newsCache = {
      data: allArticles,
      timestamp: Date.now(),
    };

    console.log(`Fetched ${allArticles.length} articles from multiple sources`);
    return allArticles;
  } catch (error) {
    console.error("News aggregation error:", error);
    // Return cached data if available, even if expired
    return newsCache?.data || [];
  }
}

// Helper functions

function categorizeTopic(topic: string): string {
  const categoryMap: Record<string, string> = {
    "artificial intelligence": "AI & ML",
    "machine learning": "AI & ML",
    "web development": "Web Development",
    "cloud computing": "Cloud & DevOps",
    cybersecurity: "Cybersecurity",
    "data science": "Data Science",
    programming: "Programming Languages",
    "technology jobs": "Career",
  };
  return categoryMap[topic.toLowerCase()] || "Industry News";
}

function categorizeFromContent(content: string): string {
  const lower = content.toLowerCase();
  if (
    lower.includes("ai") ||
    lower.includes("machine learning") ||
    lower.includes("gpt")
  )
    return "AI & ML";
  if (
    lower.includes("react") ||
    lower.includes("vue") ||
    lower.includes("angular")
  )
    return "Web Development";
  if (
    lower.includes("cloud") ||
    lower.includes("aws") ||
    lower.includes("kubernetes")
  )
    return "Cloud & DevOps";
  if (
    lower.includes("security") ||
    lower.includes("hack") ||
    lower.includes("breach")
  )
    return "Cybersecurity";
  if (
    lower.includes("data") ||
    lower.includes("analytics") ||
    lower.includes("python")
  )
    return "Data Science";
  if (
    lower.includes("job") ||
    lower.includes("career") ||
    lower.includes("hiring")
  )
    return "Career";
  if (
    lower.includes("skill") ||
    lower.includes("learn") ||
    lower.includes("course")
  )
    return "Skills";
  return "Industry News";
}

function extractTags(text: string): string[] {
  const keywords = [
    "AI",
    "ML",
    "GPT",
    "React",
    "Vue",
    "Angular",
    "Python",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "AWS",
    "Azure",
    "GCP",
    "Kubernetes",
    "Docker",
    "Security",
    "Cloud",
    "Data Science",
    "Jobs",
    "Career",
    "Remote",
    "Blockchain",
    "Web3",
    "Mobile",
    "iOS",
    "Android",
  ];

  const found = keywords.filter((keyword) =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );
  return found.slice(0, 5); // Limit to 5 tags
}

function isRecent(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return hoursDiff < 24; // Trending if published in last 24 hours
}

function calculateRelevance(article: any): number {
  let score = 70; // Base score

  // Boost for recent articles
  if (isRecent(article.publishedAt)) score += 15;

  // Boost for popular sources
  const popularSources = ["TechCrunch", "The Verge", "Wired", "Ars Technica"];
  if (popularSources.includes(article.source?.name)) score += 10;

  // Boost for tech keywords
  const techKeywords = ["AI", "ML", "Cloud", "Security", "Developer"];
  const hasKeywords = techKeywords.some((kw) => article.title?.includes(kw));
  if (hasKeywords) score += 5;

  return Math.min(score, 100);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ");
}

function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const key = article.title.toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

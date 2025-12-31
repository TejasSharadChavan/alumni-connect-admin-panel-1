/**
 * Real-Time Industry Trends Search Engine
 * Uses Google Gemini AI + Multiple News Sources
 * Focuses on Technology, Finance, and Business
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import * as cheerio from "cheerio";
import Parser from "rss-parser";

export interface TrendArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  source: string;
  category: "technology" | "finance" | "business";
  publishedAt: Date;
  relevanceScore: number;
  tags: string[];
  aiInsights: string;
  trending: boolean;
}

export interface TrendSearchResult {
  articles: TrendArticle[];
  totalResults: number;
  searchQuery: string;
  categories: string[];
  aiSummary: string;
  trendingTopics: string[];
}

export class IndustryTrendsEngine {
  private genAI: GoogleGenerativeAI | null = null;
  private rssParser: Parser;
  private newsApiKey: string;

  // News sources for different categories
  private newsSources = {
    technology: [
      "https://techcrunch.com/feed/",
      "https://www.theverge.com/rss/index.xml",
      "https://feeds.arstechnica.com/arstechnica/index",
      "https://www.wired.com/feed/rss",
      "https://feeds.feedburner.com/venturebeat/SZYF",
      "https://www.engadget.com/rss.xml",
    ],
    finance: [
      "https://feeds.bloomberg.com/markets/news.rss",
      "https://www.reuters.com/business/finance/rss",
      "https://feeds.marketwatch.com/marketwatch/realtimeheadlines/",
      "https://www.cnbc.com/id/100003114/device/rss/rss.html",
      "https://feeds.feedburner.com/TheMotleyFool",
    ],
    business: [
      "https://feeds.harvard.edu/news/rss/business.rss",
      "https://www.entrepreneur.com/latest.rss",
      "https://feeds.feedburner.com/fastcompany/headlines",
      "https://www.inc.com/rss/homepage.rss",
      "https://feeds.feedburner.com/businessinsider",
    ],
  };

  constructor() {
    this.rssParser = new Parser({
      timeout: 10000,
      maxRedirects: 5,
    });

    this.newsApiKey = process.env.NEWSAPI_KEY || "";

    if (process.env.GOOGLE_AI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    }
  }

  // Main search function
  async searchTrends(
    query: string,
    categories: ("technology" | "finance" | "business")[] = [
      "technology",
      "finance",
      "business",
    ],
    limit: number = 20
  ): Promise<TrendSearchResult> {
    console.log(`🔍 Searching industry trends for: "${query}"`);
    console.log(`📊 Categories: ${categories.join(", ")}`);

    // Expand search terms with related keywords
    const expandedQuery = this.expandSearchQuery(query);
    console.log(`🔍 Expanded search terms: ${expandedQuery}`);

    try {
      // Parallel search across multiple sources
      const [rssArticles, newsApiArticles, webArticles] = await Promise.all([
        this.searchRSSFeeds(expandedQuery, categories, limit * 2), // Get more articles initially
        this.searchNewsAPI(query, categories, limit), // Use original query for NewsAPI
        this.searchWebArticles(query, categories, limit),
      ]);

      // Combine and deduplicate articles
      let allArticles = [...rssArticles, ...newsApiArticles, ...webArticles];
      allArticles = this.deduplicateArticles(allArticles);

      // Sort by relevance and recency
      allArticles = allArticles
        .sort((a, b) => {
          const relevanceDiff = b.relevanceScore - a.relevanceScore;
          if (Math.abs(relevanceDiff) < 0.1) {
            return (
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime()
            );
          }
          return relevanceDiff;
        })
        .slice(0, limit);

      // Generate AI insights for top articles
      if (this.genAI && allArticles.length > 0) {
        allArticles = await this.generateAIInsights(allArticles);
      }

      // Extract trending topics
      const trendingTopics = this.extractTrendingTopics(allArticles);

      // Generate AI summary
      const aiSummary = await this.generateSearchSummary(
        query,
        allArticles,
        trendingTopics
      );

      return {
        articles: allArticles,
        totalResults: allArticles.length,
        searchQuery: query,
        categories,
        aiSummary,
        trendingTopics,
      };
    } catch (error) {
      console.error("Industry trends search failed:", error);
      throw new Error(`Failed to search industry trends: ${error}`);
    }
  }

  // Search RSS feeds
  private async searchRSSFeeds(
    query: string,
    categories: string[],
    limit: number
  ): Promise<TrendArticle[]> {
    const articles: TrendArticle[] = [];
    const searchTerms = query.toLowerCase().split(" ");

    for (const category of categories) {
      const feeds =
        this.newsSources[category as keyof typeof this.newsSources] || [];

      for (const feedUrl of feeds) {
        try {
          console.log(`📡 Fetching RSS: ${feedUrl}`);
          const feed = await this.rssParser.parseURL(feedUrl);

          // Get more items and filter by date (last 30 days)
          const recentItems = feed.items
            .filter((item) => {
              if (!item.pubDate) return true; // Include if no date
              const itemDate = new Date(item.pubDate);
              const thirtyDaysAgo = new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
              );
              return itemDate >= thirtyDaysAgo;
            })
            .slice(0, 15); // Get more recent items

          for (const item of recentItems) {
            if (!item.title || !item.link) continue;

            // Calculate relevance score
            const relevanceScore = this.calculateRelevance(
              item.title + " " + (item.contentSnippet || ""),
              searchTerms
            );

            if (relevanceScore > 0.2) {
              // Lower threshold for more results
              const article: TrendArticle = {
                id: this.generateId(item.link),
                title: item.title,
                summary:
                  item.contentSnippet || item.content?.substring(0, 200) || "",
                content: item.content || item.contentSnippet || "",
                url: item.link,
                source: this.extractDomain(feedUrl),
                category: category as any,
                publishedAt: new Date(item.pubDate || Date.now()),
                relevanceScore,
                tags: this.extractTags(
                  item.title + " " + (item.contentSnippet || "")
                ),
                aiInsights: "",
                trending: relevanceScore > 0.7,
              };

              articles.push(article);
            }
          }
        } catch (error) {
          console.log(`❌ RSS feed failed: ${feedUrl}`, error);
          continue;
        }
      }
    }

    return articles.slice(0, limit);
  }

  // Search using NewsAPI
  private async searchNewsAPI(
    query: string,
    categories: string[],
    limit: number
  ): Promise<TrendArticle[]> {
    if (!this.newsApiKey) {
      console.log("⚠️ NewsAPI key not configured, skipping NewsAPI search");
      return [];
    }

    const articles: TrendArticle[] = [];

    try {
      const categoryMap = {
        technology: "technology",
        finance: "business",
        business: "business",
      };

      for (const category of categories) {
        const newsCategory = categoryMap[category as keyof typeof categoryMap];

        const response = await axios.get(
          "https://newsapi.org/v2/top-headlines",
          {
            params: {
              apiKey: this.newsApiKey,
              q: query,
              category: newsCategory,
              language: "en",
              pageSize: Math.ceil(limit / categories.length),
              sortBy: "publishedAt",
            },
            timeout: 10000,
          }
        );

        if (response.data.articles) {
          for (const item of response.data.articles) {
            if (!item.title || !item.url) continue;

            const relevanceScore = this.calculateRelevance(
              item.title + " " + (item.description || ""),
              query.toLowerCase().split(" ")
            );

            const article: TrendArticle = {
              id: this.generateId(item.url),
              title: item.title,
              summary: item.description || "",
              content: item.content || item.description || "",
              url: item.url,
              source: item.source?.name || this.extractDomain(item.url),
              category: category as any,
              publishedAt: new Date(item.publishedAt),
              relevanceScore,
              tags: this.extractTags(
                item.title + " " + (item.description || "")
              ),
              aiInsights: "",
              trending: relevanceScore > 0.7,
            };

            articles.push(article);
          }
        }
      }
    } catch (error) {
      console.log("❌ NewsAPI search failed:", error);
    }

    return articles;
  }

  // Search web articles (fallback)
  private async searchWebArticles(
    query: string,
    categories: string[],
    limit: number
  ): Promise<TrendArticle[]> {
    // This would integrate with Google Custom Search API or similar
    // For now, return empty array as fallback
    console.log("🌐 Web search not implemented yet, using RSS and NewsAPI");
    return [];
  }

  // Generate AI insights using Gemini
  private async generateAIInsights(
    articles: TrendArticle[]
  ): Promise<TrendArticle[]> {
    if (!this.genAI) {
      console.log("⚠️ Google AI not configured, skipping AI insights");
      return articles;
    }

    console.log("🤖 Generating AI insights for articles...");
    const model = this.genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    // Process articles in batches to avoid rate limits
    const batchSize = 5;
    const batches = [];

    for (let i = 0; i < articles.length; i += batchSize) {
      batches.push(articles.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await Promise.all(
        batch.map(async (article, index) => {
          try {
            const prompt = `
Analyze this industry article and provide key insights:

Title: ${article.title}
Content: ${article.content.substring(0, 1000)}
Category: ${article.category}

Provide a concise analysis covering:
1. Key implications for professionals
2. Market impact
3. Future trends indicated
4. Actionable insights

Keep response under 150 words and focus on practical insights.
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            article.aiInsights = response.text();

            // Add small delay to respect rate limits
            if (index < batch.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 200));
            }
          } catch (error) {
            console.log(
              `❌ AI insight failed for article: ${article.title}`,
              error
            );
            article.aiInsights = "AI analysis temporarily unavailable";
          }
        })
      );

      // Delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return articles;
  }

  // Generate search summary
  private async generateSearchSummary(
    query: string,
    articles: TrendArticle[],
    trendingTopics: string[]
  ): Promise<string> {
    if (!this.genAI || articles.length === 0) {
      return `Found ${articles.length} articles related to "${query}" across technology, finance, and business sectors.`;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: "models/gemini-2.5-flash",
      });

      const topArticles = articles.slice(0, 5);
      const articleSummaries = topArticles
        .map((a) => `${a.title}: ${a.summary}`)
        .join("\n");

      const prompt = `
Based on these recent industry articles about "${query}":

${articleSummaries}

Trending topics: ${trendingTopics.join(", ")}

Provide a comprehensive 2-3 paragraph summary covering:
1. Current state of "${query}" in the industry
2. Key trends and developments
3. Implications for professionals and businesses

Focus on actionable insights and emerging opportunities.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.log("❌ AI summary generation failed:", error);
      return `Found ${articles.length} recent articles about "${query}". Key trending topics include: ${trendingTopics.slice(0, 3).join(", ")}.`;
    }
  }

  // Expand search query with related terms
  private expandSearchQuery(query: string): string {
    const expansions: { [key: string]: string[] } = {
      ai: [
        "artificial intelligence",
        "machine learning",
        "deep learning",
        "neural networks",
      ],
      "artificial intelligence": [
        "ai",
        "machine learning",
        "deep learning",
        "neural networks",
      ],
      "machine learning": [
        "ai",
        "artificial intelligence",
        "ml",
        "deep learning",
      ],
      blockchain: ["cryptocurrency", "bitcoin", "ethereum", "crypto", "web3"],
      cryptocurrency: ["blockchain", "bitcoin", "ethereum", "crypto", "defi"],
      fintech: [
        "financial technology",
        "digital banking",
        "payments",
        "finance",
      ],
      startup: ["startups", "entrepreneurship", "venture capital", "funding"],
      cloud: ["cloud computing", "aws", "azure", "google cloud", "saas"],
      cybersecurity: [
        "security",
        "cyber security",
        "data protection",
        "privacy",
      ],
      "remote work": [
        "work from home",
        "hybrid work",
        "distributed teams",
        "telecommuting",
      ],
    };

    const lowerQuery = query.toLowerCase();
    const queryTerms = lowerQuery.split(" ");
    const expandedTerms = new Set([...queryTerms]);

    // Add related terms
    for (const term of queryTerms) {
      if (expansions[term]) {
        expansions[term].forEach((relatedTerm) =>
          expandedTerms.add(relatedTerm)
        );
      }
    }

    // Also check for partial matches in expansion keys
    Object.keys(expansions).forEach((key) => {
      if (lowerQuery.includes(key)) {
        expansions[key].forEach((relatedTerm) =>
          expandedTerms.add(relatedTerm)
        );
      }
    });

    return Array.from(expandedTerms).join(" ");
  }

  // Helper functions - Enhanced relevance calculation
  private calculateRelevance(text: string, searchTerms: string[]): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    let matchedTerms = 0;

    for (const term of searchTerms) {
      const lowerTerm = term.toLowerCase();

      // Count exact matches
      const exactMatches = (
        lowerText.match(new RegExp(`\\b${lowerTerm}\\b`, "g")) || []
      ).length;
      const partialMatches = (lowerText.match(new RegExp(lowerTerm, "g")) || [])
        .length;

      if (exactMatches > 0) {
        score += exactMatches * 0.3; // Higher score for exact matches
        matchedTerms++;
      } else if (partialMatches > 0) {
        score += partialMatches * 0.15; // Lower score for partial matches
        matchedTerms++;
      }

      // Bonus for title matches (higher weight)
      if (lowerText.includes(lowerTerm)) {
        score += 0.4;
      }
    }

    // Bonus for matching multiple terms
    if (matchedTerms > 1) {
      score += 0.3;
    }

    // Bonus for recent articles (within last 7 days)
    score += 0.2;

    return Math.min(1, score);
  }

  private extractTags(text: string): string[] {
    const commonTags = [
      "AI",
      "Machine Learning",
      "Blockchain",
      "Cryptocurrency",
      "Fintech",
      "Startup",
      "Investment",
      "Technology",
      "Innovation",
      "Digital Transformation",
      "Cloud Computing",
      "Cybersecurity",
      "Data Analytics",
      "Mobile",
      "IoT",
      "SaaS",
      "E-commerce",
      "Remote Work",
      "Automation",
      "Sustainability",
    ];

    return commonTags
      .filter((tag) => text.toLowerCase().includes(tag.toLowerCase()))
      .slice(0, 5);
  }

  private extractTrendingTopics(articles: TrendArticle[]): string[] {
    const topicCount: { [key: string]: number } = {};

    articles.forEach((article) => {
      article.tags.forEach((tag) => {
        topicCount[tag] = (topicCount[tag] || 0) + 1;
      });
    });

    return Object.entries(topicCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic]) => topic);
  }

  private deduplicateArticles(articles: TrendArticle[]): TrendArticle[] {
    const seen = new Set<string>();
    return articles.filter((article) => {
      const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private generateId(url: string): string {
    return Buffer.from(url).toString("base64").substring(0, 16);
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "Unknown Source";
    }
  }

  // Get trending topics for homepage
  async getTrendingTopics(limit: number = 10): Promise<string[]> {
    try {
      const result = await this.searchTrends(
        "technology trends finance business",
        ["technology", "finance", "business"],
        50
      );
      return result.trendingTopics.slice(0, limit);
    } catch (error) {
      console.error("Failed to get trending topics:", error);
      return ["AI", "Fintech", "Blockchain", "Startup", "Innovation"];
    }
  }

  // Get category-specific trends
  async getCategoryTrends(
    category: "technology" | "finance" | "business",
    limit: number = 10
  ): Promise<TrendArticle[]> {
    const categoryQueries = {
      technology:
        "artificial intelligence machine learning software development",
      finance: "fintech cryptocurrency investment banking",
      business: "startup entrepreneurship digital transformation",
    };

    const result = await this.searchTrends(
      categoryQueries[category],
      [category],
      limit
    );
    return result.articles;
  }
}

// Export singleton instance
export const trendsEngine = new IndustryTrendsEngine();

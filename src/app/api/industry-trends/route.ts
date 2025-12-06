import { NextRequest, NextResponse } from "next/server";
import { aggregateNews } from "@/lib/news-aggregator";

// Real-time industry trends and news from multiple sources
// Integrates with NewsAPI, RSS feeds, and AI services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "all";
    const limit = parseInt(searchParams.get("limit") || "20");

    // Authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch real news from multiple sources
    console.log("Fetching real-time industry news...");
    let allTrends = await aggregateNews();

    // Fallback to sample data if no API keys configured
    if (allTrends.length === 0) {
      console.log("No news sources configured, using fallback data");
      allTrends = getFallbackNews();
    }

    // Convert to expected format
    const allTrendsArray = allTrends.map((article, index) => ({
      id: index + 1,
      title: article.title,
      summary: article.summary,
      category: article.category,
      source: article.source,
      date: article.date,
      url: article.url,
      image: article.image,
      tags: article.tags,
      trending: article.trending,
      relevanceScore: article.relevanceScore,
    }));

    // Filter by category
    let filteredTrends = allTrendsArray;
    if (category !== "all") {
      filteredTrends = allTrendsArray.filter(
        (trend) => trend.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Search functionality
    if (query) {
      const searchLower = query.toLowerCase();
      filteredTrends = filteredTrends.filter(
        (trend) =>
          trend.title.toLowerCase().includes(searchLower) ||
          trend.summary.toLowerCase().includes(searchLower) ||
          trend.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          trend.category.toLowerCase().includes(searchLower)
      );

      // Sort by relevance when searching
      filteredTrends.sort((a, b) => {
        const aRelevance = calculateSearchRelevance(a, query);
        const bRelevance = calculateSearchRelevance(b, query);
        return bRelevance - aRelevance;
      });
    } else {
      // Sort by date and trending status when not searching
      filteredTrends.sort((a, b) => {
        if (a.trending && !b.trending) return -1;
        if (!a.trending && b.trending) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }

    // Limit results
    const results = filteredTrends.slice(0, limit);

    // Get trending topics
    const trendingTopics = Array.from(
      new Set(allTrendsArray.filter((t) => t.trending).flatMap((t) => t.tags))
    ).slice(0, 10);

    // Get popular categories
    const categoryStats = allTrendsArray.reduce(
      (acc, trend) => {
        acc[trend.category] = (acc[trend.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      success: true,
      data: {
        trends: results,
        total: filteredTrends.length,
        query: query || null,
        category: category,
        trendingTopics,
        categories: Object.entries(categoryStats)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        lastUpdated: new Date().toISOString(),
        source: allTrends.length > 0 ? "live" : "fallback",
      },
    });
  } catch (error) {
    console.error("Industry trends error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Calculate search relevance score
function calculateSearchRelevance(trend: any, query: string): number {
  const searchLower = query.toLowerCase();
  let score = 0;

  // Title match (highest weight)
  if (trend.title.toLowerCase().includes(searchLower)) {
    score += 50;
    if (trend.title.toLowerCase().startsWith(searchLower)) {
      score += 20;
    }
  }

  // Tag exact match
  if (trend.tags.some((tag: string) => tag.toLowerCase() === searchLower)) {
    score += 30;
  }

  // Tag partial match
  if (
    trend.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
  ) {
    score += 15;
  }

  // Summary match
  if (trend.summary.toLowerCase().includes(searchLower)) {
    score += 10;
  }

  // Category match
  if (trend.category.toLowerCase().includes(searchLower)) {
    score += 20;
  }

  // Boost for trending items
  if (trend.trending) {
    score += 10;
  }

  // Boost for recent items
  const daysSincePublished = Math.floor(
    (Date.now() - new Date(trend.date).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSincePublished < 7) {
    score += 15 - daysSincePublished * 2;
  }

  return score;
}

// Fallback news when no API keys are configured
function getFallbackNews(): any[] {
  const today = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();

  return [
    {
      id: "setup-1",
      title: "🔧 Configure Real News APIs for Live Updates",
      summary:
        "Get real-time industry news by adding API keys to your .env file. Supports NewsAPI.org (100 free requests/day), RSS feeds from TechCrunch, The Verge, Dev.to, and AI enhancement via OpenAI, Gemini, or Claude. See .env.example for setup instructions.",
      category: "System Setup",
      source: "System",
      date: today,
      url: "https://newsapi.org/",
      image:
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400",
      tags: ["Setup", "Configuration", "NewsAPI", "Real-time"],
      trending: true,
      relevanceScore: 100,
    },
    {
      id: "setup-2",
      title: "📰 Multiple News Sources Supported",
      summary:
        "This platform integrates with NewsAPI for tech news, RSS feeds from major tech blogs (TechCrunch, The Verge, Dev.to), and uses AI (OpenAI/Gemini/Claude) to categorize and enhance content. News updates every 6 hours automatically.",
      category: "Features",
      source: "System",
      date: yesterday,
      url: "#",
      image:
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400",
      tags: ["Features", "Integration", "AI", "RSS"],
      trending: true,
      relevanceScore: 95,
    },
    {
      id: "setup-3",
      title: "🤖 AI-Powered News Categorization",
      summary:
        "Articles are automatically categorized into AI & ML, Web Development, Cloud & DevOps, Cybersecurity, Data Science, Career, and more using advanced AI models. Tags are extracted and relevance scores calculated for personalized recommendations.",
      category: "AI Features",
      source: "System",
      date: twoDaysAgo,
      url: "#",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
      tags: ["AI", "Categorization", "Machine Learning", "Automation"],
      trending: false,
      relevanceScore: 90,
    },
  ];
}

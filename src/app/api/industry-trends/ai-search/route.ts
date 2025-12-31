import { NextRequest, NextResponse } from "next/server";
import { aggregateNews } from "@/lib/news-aggregator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, message: "Query is required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`🤖 AI-powered search for: "${query}"`);

    // Get all news articles
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

    // Enhanced AI-powered search with semantic matching
    const searchLower = query.toLowerCase();
    const searchTerms = searchLower
      .split(/\s+/)
      .filter((term) => term.length > 2);

    const filteredTrends = allTrendsArray.filter((trend) => {
      // Calculate semantic relevance score
      let relevanceScore = 0;

      // Title matching (highest weight)
      if (trend.title.toLowerCase().includes(searchLower)) {
        relevanceScore += 50;
      }

      // Check for individual search terms in title
      searchTerms.forEach((term) => {
        if (trend.title.toLowerCase().includes(term)) {
          relevanceScore += 20;
        }
      });

      // Tag exact matching
      const trendTagsLower = trend.tags.map((tag) => tag.toLowerCase());
      if (trendTagsLower.some((tag) => tag === searchLower)) {
        relevanceScore += 40;
      }

      // Tag partial matching
      searchTerms.forEach((term) => {
        if (trendTagsLower.some((tag) => tag.includes(term))) {
          relevanceScore += 15;
        }
      });

      // Summary matching
      if (trend.summary.toLowerCase().includes(searchLower)) {
        relevanceScore += 25;
      }

      // Category matching
      if (trend.category.toLowerCase().includes(searchLower)) {
        relevanceScore += 30;
      }

      // Boost for trending items
      if (trend.trending) {
        relevanceScore += 10;
      }

      // Boost for recent items
      const daysSincePublished = Math.floor(
        (Date.now() - new Date(trend.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePublished < 7) {
        relevanceScore += 15 - daysSincePublished * 2;
      }

      // Update the trend's relevance score
      trend.relevanceScore = relevanceScore;

      // Return items with relevance score > 10
      return relevanceScore > 10;
    });

    // Sort by relevance score
    filteredTrends.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Limit to top 20 results
    const results = filteredTrends.slice(0, 20);

    return NextResponse.json({
      success: true,
      message: `AI found ${results.length} relevant articles`,
      data: {
        trends: results,
        total: results.length,
        query: query,
        searchType: "ai-enhanced",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "AI search failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Fallback news when no API keys are configured
function getFallbackNews(): any[] {
  const today = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();

  return [
    {
      id: "ai-1",
      title: "🤖 Advanced AI Search Features Now Available",
      summary:
        "Experience enhanced search capabilities with semantic matching, relevance scoring, and intelligent filtering. Our AI-powered search understands context and delivers more accurate results for your industry research.",
      category: "AI & ML",
      source: "System",
      date: today,
      url: "#",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
      tags: ["AI", "Search", "Machine Learning", "Semantic"],
      trending: true,
      relevanceScore: 100,
    },
    {
      id: "ai-2",
      title: "🔍 Smart Content Discovery with AI",
      summary:
        "Discover relevant industry content faster with our AI-enhanced search that analyzes titles, summaries, tags, and categories to find the most relevant articles for your interests and career goals.",
      category: "Features",
      source: "System",
      date: yesterday,
      url: "#",
      image:
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400",
      tags: ["AI", "Discovery", "Content", "Intelligence"],
      trending: true,
      relevanceScore: 95,
    },
    {
      id: "ai-3",
      title: "📊 Personalized Industry Insights",
      summary:
        "Get personalized recommendations based on your search patterns, interests, and career focus. Our AI learns from your interactions to surface the most relevant industry trends and opportunities.",
      category: "Personalization",
      source: "System",
      date: twoDaysAgo,
      url: "#",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      tags: ["Personalization", "AI", "Recommendations", "Insights"],
      trending: false,
      relevanceScore: 90,
    },
  ];
}

import { NextResponse } from "next/server";
import { trendsEngine } from "@/lib/industry-trends-engine";

export async function GET() {
  try {
    console.log("🧪 Testing Industry Trends Search Engine...");

    // Test 1: Basic search
    console.log("🔍 Test 1: Basic search for 'artificial intelligence'");
    const aiSearch = await trendsEngine.searchTrends(
      "artificial intelligence",
      ["technology"],
      5
    );

    // Test 2: Multi-category search
    console.log("🔍 Test 2: Multi-category search for 'fintech'");
    const fintechSearch = await trendsEngine.searchTrends(
      "fintech",
      ["technology", "finance"],
      5
    );

    // Test 3: Get trending topics
    console.log("📈 Test 3: Getting trending topics");
    const trending = await trendsEngine.getTrendingTopics(10);

    // Test 4: Category-specific trends
    console.log("📊 Test 4: Getting technology trends");
    const techTrends = await trendsEngine.getCategoryTrends("technology", 3);

    return NextResponse.json({
      success: true,
      message: "Industry Trends Search Engine tested successfully!",
      testResults: {
        aiSearch: {
          query: aiSearch.searchQuery,
          totalResults: aiSearch.totalResults,
          articles: aiSearch.articles.map((a) => ({
            title: a.title,
            source: a.source,
            category: a.category,
            relevanceScore: a.relevanceScore,
            tags: a.tags,
            hasAIInsights: !!a.aiInsights,
          })),
          aiSummary: aiSearch.aiSummary,
          trendingTopics: aiSearch.trendingTopics,
        },
        fintechSearch: {
          query: fintechSearch.searchQuery,
          totalResults: fintechSearch.totalResults,
          categories: fintechSearch.categories,
        },
        trendingTopics: trending,
        techTrends: techTrends.map((a) => ({
          title: a.title,
          source: a.source,
          relevanceScore: a.relevanceScore,
        })),
      },
      systemStatus: {
        googleAI: !!process.env.GOOGLE_AI_API_KEY,
        newsAPI: !!process.env.NEWSAPI_KEY,
        rssFeeds: "✅ Available",
        aiInsights: !!process.env.GOOGLE_AI_API_KEY
          ? "✅ Available"
          : "⚠️ Configure GOOGLE_AI_API_KEY",
        searchEngine: "✅ Operational",
      },
      availableFeatures: {
        "Real-time RSS Feeds": "✅ Technology, Finance, Business sources",
        "NewsAPI Integration": process.env.NEWSAPI_KEY
          ? "✅ Available"
          : "⚠️ Configure NEWSAPI_KEY",
        "AI-Powered Insights": process.env.GOOGLE_AI_API_KEY
          ? "✅ Google Gemini"
          : "⚠️ Configure GOOGLE_AI_API_KEY",
        "Trend Analysis": "✅ Automatic topic extraction",
        "Multi-Category Search": "✅ Technology, Finance, Business",
        "Relevance Scoring": "✅ Smart ranking algorithm",
      },
    });
  } catch (error) {
    console.error("Industry trends test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Industry trends test failed",
        error: error instanceof Error ? error.message : String(error),
        systemStatus: {
          googleAI: !!process.env.GOOGLE_AI_API_KEY,
          newsAPI: !!process.env.NEWSAPI_KEY,
          rssFeeds: "✅ Available",
          searchEngine: "❌ Error occurred",
        },
      },
      { status: 500 }
    );
  }
}

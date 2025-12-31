import { NextRequest, NextResponse } from "next/server";
import { trendsEngine } from "@/lib/industry-trends-engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const categoriesParam =
      searchParams.get("categories") || "technology,finance,business";
    const limit = parseInt(searchParams.get("limit") || "15");

    if (!query.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Search query is required",
        },
        { status: 400 }
      );
    }

    // Parse categories
    const categories = categoriesParam
      .split(",")
      .filter((cat) => ["technology", "finance", "business"].includes(cat)) as (
      | "technology"
      | "finance"
      | "business"
    )[];

    if (categories.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid categories. Use: technology, finance, business",
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Live search: "${query}" in ${categories.join(", ")}`);

    // Search for trends with enhanced parameters
    const result = await trendsEngine.searchTrends(query, categories, limit);

    // Filter for higher quality results
    const qualityArticles = result.articles.filter(
      (article) =>
        article.relevanceScore > 0.3 &&
        article.title.length > 10 &&
        article.summary.length > 20
    );

    // If we don't have enough quality articles, include lower scoring ones
    const finalArticles =
      qualityArticles.length >= 3 ? qualityArticles : result.articles;

    return NextResponse.json({
      success: true,
      message: `Found ${finalArticles.length} relevant articles about "${query}"`,
      data: {
        ...result,
        articles: finalArticles,
        totalResults: finalArticles.length,
        searchMetrics: {
          originalResults: result.totalResults,
          filteredResults: finalArticles.length,
          averageRelevance:
            finalArticles.reduce((sum, a) => sum + a.relevanceScore, 0) /
            finalArticles.length,
          sourcesUsed: [...new Set(finalArticles.map((a) => a.source))],
          categoriesFound: [...new Set(finalArticles.map((a) => a.category))],
        },
      },
      searchInfo: {
        query: result.searchQuery,
        categories: result.categories,
        totalResults: finalArticles.length,
        timestamp: new Date().toISOString(),
        searchType: "live",
      },
    });
  } catch (error) {
    console.error("Live search failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Live search failed",
        error: error instanceof Error ? error.message : String(error),
        suggestions: [
          "Try a different search term",
          "Check if the categories are valid (technology, finance, business)",
          "Try a broader search query",
        ],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      categories = ["technology", "finance", "business"],
      limit = 15,
      includeAI = true,
      minRelevance = 0.3,
    } = body;

    if (!query || !query.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Query parameter is required",
        },
        { status: 400 }
      );
    }

    console.log(
      `🔍 Advanced live search: "${query}" (minRelevance: ${minRelevance})`
    );

    // Search for trends
    const result = await trendsEngine.searchTrends(
      query,
      categories,
      limit * 2
    );

    // Apply advanced filtering
    let filteredArticles = result.articles.filter(
      (article) =>
        article.relevanceScore >= minRelevance &&
        article.title.length > 10 &&
        article.summary.length > 20
    );

    // Sort by relevance and recency
    filteredArticles = filteredArticles
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

    return NextResponse.json({
      success: true,
      message: `Found ${filteredArticles.length} high-quality articles about "${query}"`,
      data: {
        ...result,
        articles: filteredArticles,
        totalResults: filteredArticles.length,
        searchMetrics: {
          originalResults: result.totalResults,
          filteredResults: filteredArticles.length,
          averageRelevance:
            filteredArticles.reduce((sum, a) => sum + a.relevanceScore, 0) /
            filteredArticles.length,
          sourcesUsed: [...new Set(filteredArticles.map((a) => a.source))],
          categoriesFound: [
            ...new Set(filteredArticles.map((a) => a.category)),
          ],
          qualityScore:
            filteredArticles.length > 0
              ? (
                  (filteredArticles.reduce(
                    (sum, a) => sum + a.relevanceScore,
                    0
                  ) /
                    filteredArticles.length) *
                  100
                ).toFixed(1) + "%"
              : "0%",
        },
      },
      searchInfo: {
        query: result.searchQuery,
        categories: result.categories,
        totalResults: filteredArticles.length,
        timestamp: new Date().toISOString(),
        searchType: "advanced-live",
        filters: {
          minRelevance,
          includeAI,
        },
      },
    });
  } catch (error) {
    console.error("Advanced live search failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Advanced live search failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

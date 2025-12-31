import { NextRequest, NextResponse } from "next/server";
import { trendsEngine } from "@/lib/industry-trends-engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category") as
      | "technology"
      | "finance"
      | "business"
      | null;

    console.log(
      `📈 Getting trending topics${category ? ` for ${category}` : ""}`
    );

    if (category) {
      // Get category-specific trends
      const articles = await trendsEngine.getCategoryTrends(category, limit);

      return NextResponse.json({
        success: true,
        message: `Found ${articles.length} trending ${category} articles`,
        data: {
          category,
          articles,
          totalResults: articles.length,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      // Get general trending topics
      const trendingTopics = await trendsEngine.getTrendingTopics(limit);

      return NextResponse.json({
        success: true,
        message: `Found ${trendingTopics.length} trending topics`,
        data: {
          trendingTopics,
          totalResults: trendingTopics.length,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error("Failed to get trending topics:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get trending topics",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

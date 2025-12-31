import { NextRequest, NextResponse } from "next/server";
import { trendsEngine } from "@/lib/industry-trends-engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "technology trends";
    const categoriesParam =
      searchParams.get("categories") || "technology,finance,business";
    const limit = parseInt(searchParams.get("limit") || "20");

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

    console.log(
      `🔍 Industry trends search: "${query}" in ${categories.join(", ")}`
    );

    // Search for trends
    const result = await trendsEngine.searchTrends(query, categories, limit);

    return NextResponse.json({
      success: true,
      message: `Found ${result.totalResults} articles about "${query}"`,
      data: result,
      searchInfo: {
        query: result.searchQuery,
        categories: result.categories,
        totalResults: result.totalResults,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Industry trends search failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search industry trends",
        error: error instanceof Error ? error.message : String(error),
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
      limit = 20,
    } = body;

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          message: "Query parameter is required",
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Advanced industry trends search: "${query}"`);

    // Search for trends
    const result = await trendsEngine.searchTrends(query, categories, limit);

    return NextResponse.json({
      success: true,
      message: `Found ${result.totalResults} articles about "${query}"`,
      data: result,
      searchInfo: {
        query: result.searchQuery,
        categories: result.categories,
        totalResults: result.totalResults,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Advanced industry trends search failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search industry trends",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

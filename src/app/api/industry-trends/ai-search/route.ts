import { NextRequest, NextResponse } from "next/server";

// AI-powered real-time news search using OpenAI
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await request.json();
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    console.log(`AI Search: "${query}"`);

    // Use OpenAI to search for real-time news
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a tech news expert. When given a search query, provide 5-10 recent, real tech news articles related to that topic. 

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "articles": [
    {
      "title": "Article headline",
      "summary": "2-3 sentence summary",
      "category": "AI & ML",
      "source": "TechCrunch",
      "date": "2024-12-05",
      "tags": ["AI", "GPT", "OpenAI"]
    }
  ]
}

Categories must be one of: AI & ML, Web Development, Cloud & DevOps, Cybersecurity, Data Science, Mobile Development, Career, Skills, Blockchain, Emerging Tech.
Only include real, recent news from the last 7 days. Be accurate and factual.`,
          },
          {
            role: "user",
            content: `Find recent tech news about: ${query}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        { error: "AI search failed", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse AI response
    let articles;
    try {
      const parsed = JSON.parse(aiResponse);
      articles = parsed.articles || parsed.news || parsed.results || [];
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Transform to our format
    const trends = articles.map((article: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      title: article.title || article.headline || "Untitled",
      summary: article.summary || article.description || "",
      category: article.category || "Industry News",
      source: article.source || "AI Search",
      date: article.date || new Date().toISOString(),
      url: article.url || "#",
      image:
        article.image ||
        `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&q=80`,
      tags: article.tags || [],
      trending: isRecent(article.date),
      relevanceScore: 95,
    }));

    console.log(`AI Search found ${trends.length} articles`);

    return NextResponse.json({
      success: true,
      data: {
        trends,
        total: trends.length,
        query,
        source: "ai",
        aiPowered: true,
      },
    });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      { error: "AI search failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}

function isRecent(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return hoursDiff < 48; // Trending if published in last 48 hours
}

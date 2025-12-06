import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessions, users, posts } from "@/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0) return null;

    const expiresAt = new Date(session[0].expiresAt);
    if (expiresAt < new Date()) return null;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session[0].userId))
      .limit(1);

    if (user.length === 0) return null;

    // Accept both 'active' and 'approved' status
    if (user[0].status !== "active" && user[0].status !== "approved")
      return null;

    return user[0];
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const scope = searchParams.get("scope") ?? "global";
    const branch = searchParams.get("branch");

    // Try calling Python ML service first
    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";
    try {
      const response = await fetch(
        `${mlServiceUrl}/trending-topics?scope=${scope}${branch ? `&branch=${branch}` : ""}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (mlError) {
      console.log("ML service unavailable, using fallback");
    }

    // Fallback: extract trending topics from recent posts
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const conditions = [
      eq(posts.status, "approved"),
      gte(posts.createdAt, startDate.toISOString()),
    ];

    if (scope === "branch" && branch) {
      conditions.push(eq(posts.branch, branch));
    }

    const recentPosts = await db
      .select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.createdAt))
      .limit(100);

    // Extract keywords from posts (simple word frequency)
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "from",
      "as",
      "is",
      "was",
      "are",
      "were",
      "been",
      "be",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "should",
      "could",
      "may",
      "might",
      "must",
      "can",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "my",
      "your",
      "his",
      "her",
      "its",
      "our",
      "their",
    ]);

    recentPosts.forEach((post) => {
      const words = post.content
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !stopWords.has(w));

      words.forEach((word) => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
    });

    // Get top keywords
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, freq]) => ({ word, frequency: freq }));

    // Group into topics (simple clustering by frequency)
    const topics = [
      {
        topic_id: "topic_1",
        name: topKeywords
          .slice(0, 3)
          .map((k) => k.word)
          .join(", "),
        keywords: topKeywords.slice(0, 5).map((k) => k.word),
        weight: 0.25,
        post_count: recentPosts.filter((p) =>
          topKeywords
            .slice(0, 3)
            .some((k) => p.content.toLowerCase().includes(k.word))
        ).length,
      },
      {
        topic_id: "topic_2",
        name: topKeywords
          .slice(3, 6)
          .map((k) => k.word)
          .join(", "),
        keywords: topKeywords.slice(3, 8).map((k) => k.word),
        weight: 0.2,
        post_count: recentPosts.filter((p) =>
          topKeywords
            .slice(3, 6)
            .some((k) => p.content.toLowerCase().includes(k.word))
        ).length,
      },
      {
        topic_id: "topic_3",
        name: topKeywords
          .slice(6, 9)
          .map((k) => k.word)
          .join(", "),
        keywords: topKeywords.slice(6, 11).map((k) => k.word),
        weight: 0.15,
        post_count: recentPosts.filter((p) =>
          topKeywords
            .slice(6, 9)
            .some((k) => p.content.toLowerCase().includes(k.word))
        ).length,
      },
    ];

    return NextResponse.json({
      scope,
      branch: branch || null,
      period_days: 30,
      topics,
      top_keywords: topKeywords,
      total_posts_analyzed: recentPosts.length,
      insights: [
        `${recentPosts.length} posts analyzed from the last 30 days`,
        `Top trending: ${topKeywords[0]?.word || "N/A"}`,
        `Most discussed category: ${recentPosts[0]?.category || "general"}`,
      ],
    });
  } catch (error) {
    console.error("ML trending-topics error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze trending topics",
        code: "TRENDING_ANALYSIS_FAILED",
      },
      { status: 500 }
    );
  }
}

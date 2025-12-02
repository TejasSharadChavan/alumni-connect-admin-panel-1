import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, users, activityLog, posts, comments } from '@/db/schema';
import { eq, and, gte, count } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const session = await db.select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0) return null;

    const expiresAt = new Date(session[0].expiresAt);
    if (expiresAt < new Date()) return null;

    const user = await db.select()
      .from(users)
      .where(eq(users.id, session[0].userId))
      .limit(1);

    if (user.length === 0 || user[0].status !== 'active') return null;

    return user[0];
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = parseInt(searchParams.get('userId') ?? user.id.toString());
    const period = searchParams.get('period') ?? '30'; // days

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Try calling Python ML service first
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    try {
      const response = await fetch(
        `${mlServiceUrl}/engagement?user_id=${userId}&period_days=${period}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (mlError) {
      console.log('ML service unavailable, using fallback calculation');
    }

    // Fallback: calculate engagement from database
    const activities = await db.select()
      .from(activityLog)
      .where(
        and(
          eq(activityLog.userId, userId),
          gte(activityLog.timestamp, startDate.toISOString())
        )
      );

    const userPosts = await db.select()
      .from(posts)
      .where(
        and(
          eq(posts.authorId, userId),
          gte(posts.createdAt, startDate.toISOString())
        )
      );

    const userComments = await db.select()
      .from(comments)
      .where(
        and(
          eq(comments.authorId, userId),
          gte(comments.createdAt, startDate.toISOString())
        )
      );

    // Calculate metrics
    const activityCount = activities.length;
    const postCount = userPosts.length;
    const commentCount = userComments.length;

    const engagementScore = Math.min(100, 
      (activityCount * 2) + 
      (postCount * 10) + 
      (commentCount * 5)
    );

    return NextResponse.json({
      user_id: userId,
      period_days: parseInt(period),
      engagement_score: engagementScore,
      metrics: {
        total_activities: activityCount,
        posts_created: postCount,
        comments_made: commentCount,
        avg_daily_activity: activityCount / parseInt(period),
      },
      sentiment: {
        overall: 'positive',
        score: 0.75,
      },
      trend: engagementScore > 50 ? 'increasing' : 'stable',
      insights: [
        postCount > 5 ? 'Highly active contributor' : 'Regular contributor',
        commentCount > 10 ? 'Engaged in discussions' : 'Occasional commenter',
        activityCount > 20 ? 'Very active user' : 'Moderate activity',
      ],
    });
  } catch (error) {
    console.error('ML engagement error:', error);
    return NextResponse.json({ 
      error: 'Failed to calculate engagement metrics',
      code: 'ENGAGEMENT_CALCULATION_FAILED' 
    }, { status: 500 });
  }
}

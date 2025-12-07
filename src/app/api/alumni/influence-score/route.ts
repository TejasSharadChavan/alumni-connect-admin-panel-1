import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  sessions,
  mentorshipRequests,
  jobs,
  posts,
  referrals,
  events,
  comments,
  postReactions,
} from "@/db/schema";
import { eq, and, sql, count } from "drizzle-orm";

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) return null;

    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "alumni") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate influence score based on multiple factors

    // 1. Mentorship sessions (weight: 30%)
    const mentorshipData = await db
      .select({ count: count() })
      .from(mentorshipRequests)
      .where(
        and(
          eq(mentorshipRequests.mentorId, user.id),
          eq(mentorshipRequests.status, "accepted")
        )
      );
    const mentorshipCount = mentorshipData[0]?.count || 0;
    const mentorshipScore = Math.min(mentorshipCount * 5, 30);

    // 2. Jobs posted (weight: 25%)
    const jobsData = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.postedById, user.id));
    const jobsCount = jobsData[0]?.count || 0;
    const jobsScore = Math.min(jobsCount * 8, 25);

    // 3. Referrals given (weight: 20%)
    const referralsData = await db
      .select({ count: count() })
      .from(referrals)
      .where(eq(referrals.alumniId, user.id));
    const referralsCount = referralsData[0]?.count || 0;
    const referralsScore = Math.min(referralsCount * 10, 20);

    // 4. Posts created (weight: 15%)
    const postsData = await db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.authorId, user.id));
    const postsCount = postsData[0]?.count || 0;
    const postsScore = Math.min(postsCount * 3, 15);

    // 5. Engagement (comments + reactions) (weight: 10%)
    const commentsData = await db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.authorId, user.id));
    const commentsCount = commentsData[0]?.count || 0;

    const reactionsData = await db
      .select({ count: count() })
      .from(postReactions)
      .where(eq(postReactions.userId, user.id));
    const reactionsCount = reactionsData[0]?.count || 0;

    const engagementScore = Math.min(
      (commentsCount + reactionsCount) * 0.5,
      10
    );

    // Calculate total influence score (out of 100)
    const totalScore = Math.round(
      mentorshipScore +
        jobsScore +
        referralsScore +
        postsScore +
        engagementScore
    );

    // Calculate percentile (simplified - in production, compare with all alumni)
    const allAlumni = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "alumni"));
    const totalAlumni = allAlumni.length;

    // Simplified percentile calculation
    let percentile = 50;
    if (totalScore >= 80) percentile = 90;
    else if (totalScore >= 60) percentile = 75;
    else if (totalScore >= 40) percentile = 50;
    else if (totalScore >= 20) percentile = 25;
    else percentile = 10;

    // Get breakdown
    const breakdown = {
      mentorship: {
        score: mentorshipScore,
        count: mentorshipCount,
        maxScore: 30,
      },
      jobs: {
        score: jobsScore,
        count: jobsCount,
        maxScore: 25,
      },
      referrals: {
        score: referralsScore,
        count: referralsCount,
        maxScore: 20,
      },
      posts: {
        score: postsScore,
        count: postsCount,
        maxScore: 15,
      },
      engagement: {
        score: engagementScore,
        count: commentsCount + reactionsCount,
        maxScore: 10,
      },
    };

    // Calculate next milestone
    let nextMilestone = 100;
    let nextMilestoneLabel = "Maximum Impact";
    if (totalScore < 25) {
      nextMilestone = 25;
      nextMilestoneLabel = "Rising Contributor";
    } else if (totalScore < 50) {
      nextMilestone = 50;
      nextMilestoneLabel = "Active Mentor";
    } else if (totalScore < 75) {
      nextMilestone = 75;
      nextMilestoneLabel = "Community Leader";
    } else if (totalScore < 90) {
      nextMilestone = 90;
      nextMilestoneLabel = "Top Influencer";
    }

    return NextResponse.json({
      success: true,
      influenceScore: {
        total: totalScore,
        percentile,
        breakdown,
        nextMilestone,
        nextMilestoneLabel,
        pointsToNext: nextMilestone - totalScore,
      },
    });
  } catch (error) {
    console.error("Error calculating influence score:", error);
    return NextResponse.json(
      { error: "Failed to calculate influence score" },
      { status: 500 }
    );
  }
}

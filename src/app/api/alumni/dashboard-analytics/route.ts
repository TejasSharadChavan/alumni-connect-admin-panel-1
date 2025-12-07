import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  sessions,
  mentorshipRequests,
  jobs,
  donations,
  connections,
} from "@/db/schema";
import { eq, and, gte, sql, count } from "drizzle-orm";

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

    // Get date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get monthly impact data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      // Count mentees for this month
      const menteesCount = await db
        .select({ count: count() })
        .from(mentorshipRequests)
        .where(
          and(
            eq(mentorshipRequests.mentorId, user.id),
            gte(mentorshipRequests.createdAt, monthStart.toISOString()),
            sql`${mentorshipRequests.createdAt} < ${monthEnd.toISOString()}`,
            sql`${mentorshipRequests.status} IN ('accepted', 'completed')`
          )
        );

      // Count jobs posted this month
      const jobsCount = await db
        .select({ count: count() })
        .from(jobs)
        .where(
          and(
            eq(jobs.postedById, user.id),
            gte(jobs.createdAt, monthStart.toISOString()),
            sql`${jobs.createdAt} < ${monthEnd.toISOString()}`
          )
        );

      // Sum donations this month
      const donationsSum = await db
        .select({ total: sql<number>`COALESCE(SUM(${donations.amount}), 0)` })
        .from(donations)
        .where(
          and(
            eq(donations.donorId, user.id),
            gte(donations.createdAt, monthStart.toISOString()),
            sql`${donations.createdAt} < ${monthEnd.toISOString()}`
          )
        );

      monthlyData.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        mentees: menteesCount[0]?.count || 0,
        jobs: jobsCount[0]?.count || 0,
        donations: Number(donationsSum[0]?.total) || 0,
      });
    }

    // Get contribution breakdown
    const totalMentees = await db
      .select({ count: count() })
      .from(mentorshipRequests)
      .where(
        and(
          eq(mentorshipRequests.mentorId, user.id),
          sql`${mentorshipRequests.status} IN ('accepted', 'completed')`
        )
      );

    const totalJobs = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.postedById, user.id));

    const totalDonationsSum = await db
      .select({ total: sql<number>`COALESCE(SUM(${donations.amount}), 0)` })
      .from(donations)
      .where(eq(donations.donorId, user.id));

    // Get network growth (connections in last 6 months vs previous 6 months)
    const recentConnections = await db
      .select({ count: count() })
      .from(connections)
      .where(
        and(
          sql`(${connections.requesterId} = ${user.id} OR ${connections.responderId} = ${user.id})`,
          gte(connections.createdAt, sixMonthsAgo.toISOString()),
          sql`${connections.status} = 'accepted'`
        )
      );

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const previousConnections = await db
      .select({ count: count() })
      .from(connections)
      .where(
        and(
          sql`(${connections.requesterId} = ${user.id} OR ${connections.responderId} = ${user.id})`,
          gte(connections.createdAt, twelveMonthsAgo.toISOString()),
          sql`${connections.createdAt} < ${sixMonthsAgo.toISOString()}`,
          sql`${connections.status} = 'accepted'`
        )
      );

    const recentCount = recentConnections[0]?.count || 0;
    const previousCount = previousConnections[0]?.count || 1; // Avoid division by zero
    const growthPercentage = Math.round(
      ((recentCount - previousCount) / previousCount) * 100
    );

    const contributionData = [
      {
        category: "Mentorship",
        value: (totalMentees[0]?.count || 0) * 10, // Weight mentorship
      },
      {
        category: "Job Postings",
        value: (totalJobs[0]?.count || 0) * 8, // Weight jobs
      },
      {
        category: "Donations",
        value: Math.round((Number(totalDonationsSum[0]?.total) || 0) / 1000), // Convert to thousands
      },
      {
        category: "Network",
        value: recentCount * 2, // Weight connections
      },
    ];

    return NextResponse.json({
      success: true,
      analytics: {
        monthlyImpact: monthlyData,
        contributionBreakdown: contributionData,
        networkGrowth:
          growthPercentage >= 0
            ? `+${growthPercentage}%`
            : `${growthPercentage}%`,
        totals: {
          mentees: totalMentees[0]?.count || 0,
          jobs: totalJobs[0]?.count || 0,
          donations: Number(totalDonationsSum[0]?.total) || 0,
          connections: recentCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

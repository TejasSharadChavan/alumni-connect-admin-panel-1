import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  sessions,
  mentorshipRequests,
  jobs,
  donations,
  connections,
  referrals,
  events,
  applications,
  notifications,
} from "@/db/schema";
import { eq, and, gte, sql, count, or } from "drizzle-orm";

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

    console.log(`Fetching analytics for alumni user ID: ${user.id}`);

    // Get current totals first (for debugging)
    const [
      totalJobsResult,
      totalConnectionsResult,
      totalReferralsResult,
      totalMentorshipResult,
      totalDonationsResult,
      totalEventsResult,
      totalApplicationsResult,
    ] = await Promise.all([
      // Jobs posted by this alumni
      db
        .select({ count: count() })
        .from(jobs)
        .where(eq(jobs.postedById, user.id)),

      // Connections (both directions)
      db
        .select({ count: count() })
        .from(connections)
        .where(
          and(
            or(
              eq(connections.requesterId, user.id),
              eq(connections.responderId, user.id)
            ),
            eq(connections.status, "accepted")
          )
        ),

      // Referrals created
      db
        .select({ count: count() })
        .from(referrals)
        .where(eq(referrals.alumniId, user.id)),

      // Mentorship requests where this user is the mentor
      db
        .select({ count: count() })
        .from(mentorshipRequests)
        .where(eq(mentorshipRequests.mentorId, user.id)),

      // Donations made by this user
      db
        .select({
          total: sql<number>`COALESCE(SUM(${donations.amount}), 0)`,
          count: count(),
        })
        .from(donations)
        .where(eq(donations.donorId, user.id)),

      // Events organized by this alumni
      db
        .select({ count: count() })
        .from(events)
        .where(eq(events.organizerId, user.id)),

      // Applications to jobs posted by this alumni
      db
        .select({ count: count() })
        .from(applications)
        .innerJoin(jobs, eq(applications.jobId, jobs.id))
        .where(eq(jobs.postedById, user.id)),
    ]);

    const currentTotals = {
      jobs: totalJobsResult[0]?.count || 0,
      connections: totalConnectionsResult[0]?.count || 0,
      referrals: totalReferralsResult[0]?.count || 0,
      mentorship: totalMentorshipResult[0]?.count || 0,
      donations: Number(totalDonationsResult[0]?.total) || 0,
      donationCount: totalDonationsResult[0]?.count || 0,
      events: totalEventsResult[0]?.count || 0,
      applications: totalApplicationsResult[0]?.count || 0,
    };

    console.log("Current totals:", currentTotals);

    // Get date ranges
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

      // Get data for this month
      const [monthJobs, monthMentorship, monthDonations] = await Promise.all([
        db
          .select({ count: count() })
          .from(jobs)
          .where(
            and(
              eq(jobs.postedById, user.id),
              gte(jobs.createdAt, monthStart.toISOString()),
              sql`${jobs.createdAt} < ${monthEnd.toISOString()}`
            )
          ),

        db
          .select({ count: count() })
          .from(mentorshipRequests)
          .where(
            and(
              eq(mentorshipRequests.mentorId, user.id),
              gte(mentorshipRequests.createdAt, monthStart.toISOString()),
              sql`${mentorshipRequests.createdAt} < ${monthEnd.toISOString()}`,
              sql`${mentorshipRequests.status} IN ('accepted', 'completed')`
            )
          ),

        db
          .select({ total: sql<number>`COALESCE(SUM(${donations.amount}), 0)` })
          .from(donations)
          .where(
            and(
              eq(donations.donorId, user.id),
              gte(donations.createdAt, monthStart.toISOString()),
              sql`${donations.createdAt} < ${monthEnd.toISOString()}`
            )
          ),
      ]);

      monthlyData.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        mentees: monthMentorship[0]?.count || 0,
        jobs: monthJobs[0]?.count || 0,
        donations: Number(monthDonations[0]?.total) || 0,
      });
    }

    // Calculate network growth
    const recentConnections = await db
      .select({ count: count() })
      .from(connections)
      .where(
        and(
          or(
            eq(connections.requesterId, user.id),
            eq(connections.responderId, user.id)
          ),
          gte(connections.createdAt, sixMonthsAgo.toISOString()),
          eq(connections.status, "accepted")
        )
      );

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const previousConnections = await db
      .select({ count: count() })
      .from(connections)
      .where(
        and(
          or(
            eq(connections.requesterId, user.id),
            eq(connections.responderId, user.id)
          ),
          gte(connections.createdAt, twelveMonthsAgo.toISOString()),
          sql`${connections.createdAt} < ${sixMonthsAgo.toISOString()}`,
          eq(connections.status, "accepted")
        )
      );

    const recentCount = recentConnections[0]?.count || 0;
    const previousCount = previousConnections[0]?.count || 0;

    let growthPercentage;
    let networkGrowthText;

    if (previousCount === 0) {
      // No previous connections - show as new growth
      if (recentCount > 0) {
        networkGrowthText = `+${recentCount} new`;
      } else {
        networkGrowthText = "No growth";
      }
    } else {
      // Calculate percentage growth
      growthPercentage = Math.round(
        ((recentCount - previousCount) / previousCount) * 100
      );
      networkGrowthText =
        growthPercentage >= 0
          ? `+${growthPercentage}%`
          : `${growthPercentage}%`;
    }

    // Create contribution breakdown with real data
    const contributionData = [
      {
        category: "Mentorship",
        value: currentTotals.mentorship * 10, // Weight mentorship
      },
      {
        category: "Job Postings",
        value: currentTotals.jobs * 8, // Weight jobs
      },
      {
        category: "Donations",
        value: Math.round(currentTotals.donations / 1000), // Convert to thousands
      },
      {
        category: "Network",
        value: currentTotals.connections * 5, // Weight connections
      },
      {
        category: "Referrals",
        value: currentTotals.referrals * 6, // Weight referrals
      },
    ];

    const analytics = {
      monthlyImpact: monthlyData,
      contributionBreakdown: contributionData,
      networkGrowth: networkGrowthText,
      totals: {
        mentees: currentTotals.mentorship,
        jobs: currentTotals.jobs,
        donations: currentTotals.donations,
        connections: currentTotals.connections,
        referrals: currentTotals.referrals,
        events: currentTotals.events,
        applications: currentTotals.applications,
      },
      // Additional metrics for dashboard
      stats: {
        jobsPosted: currentTotals.jobs,
        jobApplications: currentTotals.applications,
        eventsOrganized: currentTotals.events,
        connections: currentTotals.connections,
        mentorshipRequests: currentTotals.mentorship,
        referralsCreated: currentTotals.referrals,
        totalDonations: currentTotals.donations,
        donationCount: currentTotals.donationCount,
      },
    };

    console.log("Returning analytics:", analytics);

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics", details: error.message },
      { status: 500 }
    );
  }
}

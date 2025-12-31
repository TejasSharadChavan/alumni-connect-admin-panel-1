import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  posts,
  applications,
  connections,
  mentorshipRequests,
  jobs,
  events,
  rsvps,
  comments,
  referralUsage,
  messages,
} from "@/db/schema";
import { eq, and, count, sql, gte, desc, isNotNull } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get current date for time-based queries
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Execute all queries in parallel for better performance
    const [
      // User counts
      [totalUsersResult],
      [studentsResult],
      [alumniResult],
      [facultyResult],
      [pendingApprovalsResult],
      [activeUsersResult],
      [newUsersThisMonthResult],

      // Engagement metrics
      [totalPostsResult],
      [totalCommentsResult],
      [totalConnectionsResult],
      [activeMentorshipsResult],
      [totalApplicationsResult],
      [totalJobsResult],
      [activeJobsResult],
      [totalEventsResult],
      [upcomingEventsResult],
      [totalRsvpsResult],
      [totalMessagesResult],
      [referralUsageResult],

      // Recent activity
      recentPosts,
      recentUsers,
      recentApplications,
    ] = await Promise.all([
      // User counts
      db.select({ count: count() }).from(users),
      db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "student")),
      db.select({ count: count() }).from(users).where(eq(users.role, "alumni")),
      db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "faculty")),
      db
        .select({ count: count() })
        .from(users)
        .where(eq(users.status, "pending")),
      db
        .select({ count: count() })
        .from(users)
        .where(
          and(eq(users.status, "active"), gte(users.lastLoginAt, thirtyDaysAgo))
        ),
      db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo)),

      // Engagement metrics
      db.select({ count: count() }).from(posts),
      db.select({ count: count() }).from(comments),
      db.select({ count: count() }).from(connections),
      db
        .select({ count: count() })
        .from(mentorshipRequests)
        .where(eq(mentorshipRequests.status, "accepted")),
      db.select({ count: count() }).from(applications),
      db.select({ count: count() }).from(jobs),
      db
        .select({ count: count() })
        .from(jobs)
        .where(
          and(eq(jobs.status, "active"), gte(jobs.applicationDeadline, now))
        ),
      db.select({ count: count() }).from(events),
      db.select({ count: count() }).from(events).where(gte(events.date, now)),
      db.select({ count: count() }).from(rsvps),
      db.select({ count: count() }).from(messages),
      db.select({ count: count() }).from(referralUsage),

      // Recent activity for trends
      db
        .select({
          date: sql<string>`DATE(${posts.createdAt})`,
          count: count(),
        })
        .from(posts)
        .where(gte(posts.createdAt, sevenDaysAgo))
        .groupBy(sql`DATE(${posts.createdAt})`)
        .orderBy(sql`DATE(${posts.createdAt})`),

      db
        .select({
          id: users.id,
          name: users.name,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(gte(users.createdAt, sevenDaysAgo))
        .orderBy(desc(users.createdAt))
        .limit(10),

      db
        .select({
          date: sql<string>`DATE(${applications.createdAt})`,
          count: count(),
        })
        .from(applications)
        .where(gte(applications.createdAt, sevenDaysAgo))
        .groupBy(sql`DATE(${applications.createdAt})`)
        .orderBy(sql`DATE(${applications.createdAt})`),
    ]);

    // Calculate derived metrics
    const totalUsers = totalUsersResult.count;
    const students = studentsResult.count;
    const alumni = alumniResult.count;
    const faculty = facultyResult.count;
    const pendingApprovals = pendingApprovalsResult.count;
    const activeUsers = activeUsersResult.count;
    const newUsersThisMonth = newUsersThisMonthResult.count;

    const totalPosts = totalPostsResult.count;
    const totalComments = totalCommentsResult.count;
    const totalConnections = totalConnectionsResult.count;
    const activeMentorships = activeMentorshipsResult.count;
    const totalApplications = totalApplicationsResult.count;
    const totalJobs = totalJobsResult.count;
    const activeJobs = activeJobsResult.count;
    const totalEvents = totalEventsResult.count;
    const upcomingEvents = upcomingEventsResult.count;
    const totalRsvps = totalRsvpsResult.count;
    const totalMessages = totalMessagesResult.count;
    const referralUsage = referralUsageResult.count;

    // Calculate engagement rates and other derived metrics
    const userEngagementRate =
      totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
    const postEngagementRate =
      totalPosts > 0 ? (totalComments / totalPosts) * 100 : 0;
    const jobApplicationRate =
      totalJobs > 0 ? (totalApplications / totalJobs) * 100 : 0;
    const eventAttendanceRate =
      totalEvents > 0 ? (totalRsvps / totalEvents) * 100 : 0;
    const mentorshipSuccessRate =
      students > 0 ? (activeMentorships / students) * 100 : 0;

    // Calculate growth trends
    const userGrowthRate =
      totalUsers > 0 ? (newUsersThisMonth / totalUsers) * 100 : 0;

    // Industry breakdown (based on user profiles)
    const industryBreakdown = await db
      .select({
        industry: users.industry,
        count: count(),
      })
      .from(users)
      .where(and(eq(users.role, "alumni"), isNotNull(users.industry)))
      .groupBy(users.industry)
      .orderBy(desc(count()))
      .limit(10);

    // Branch/Department breakdown
    const branchBreakdown = await db
      .select({
        branch: users.branch,
        students: count(sql`CASE WHEN ${users.role} = 'student' THEN 1 END`),
        alumni: count(sql`CASE WHEN ${users.role} = 'alumni' THEN 1 END`),
      })
      .from(users)
      .where(isNotNull(users.branch))
      .groupBy(users.branch)
      .orderBy(desc(count()))
      .limit(10);

    const stats = {
      // Core user metrics
      totalUsers,
      students,
      alumni,
      faculty,
      pendingApprovals,
      activeUsers,
      newUsersThisMonth,

      // Engagement metrics
      totalPosts,
      totalComments,
      totalConnections,
      activeMentorships,
      totalApplications,
      totalJobs,
      activeJobs,
      totalEvents,
      upcomingEvents,
      totalRsvps,
      totalMessages,
      referralUsage,

      // Calculated rates
      userEngagementRate: Math.round(userEngagementRate * 100) / 100,
      postEngagementRate: Math.round(postEngagementRate * 100) / 100,
      jobApplicationRate: Math.round(jobApplicationRate * 100) / 100,
      eventAttendanceRate: Math.round(eventAttendanceRate * 100) / 100,
      mentorshipSuccessRate: Math.round(mentorshipSuccessRate * 100) / 100,
      userGrowthRate: Math.round(userGrowthRate * 100) / 100,

      // Breakdowns
      industryBreakdown,
      branchBreakdown,

      // Trends
      recentPostTrends: recentPosts,
      recentUsers,
      recentApplicationTrends: recentApplications,

      // Timestamps
      lastUpdated: new Date().toISOString(),
      dataRange: {
        thirtyDaysAgo: thirtyDaysAgo.toISOString(),
        sevenDaysAgo: sevenDaysAgo.toISOString(),
        now: now.toISOString(),
      },
    };

    return NextResponse.json({
      success: true,
      stats,
      message: "Real-time statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching real admin stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

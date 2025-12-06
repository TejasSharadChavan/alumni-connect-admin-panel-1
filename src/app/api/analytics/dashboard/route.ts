import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  connections,
  posts,
  jobs,
  events,
  messages,
  applications,
  rsvps,
  mentorshipRequests as mentorshipRequestsTable,
  userSkills,
} from "@/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const timeRange = request.nextUrl.searchParams.get("range") || "30"; // days

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId" },
        { status: 400 }
      );
    }

    const now = new Date();
    const startDate = new Date(
      now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000
    );

    // Get user with error handling
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userIdNum))
      .catch((error) => {
        console.error("Database error fetching user:", error);
        return [];
      });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch all data in parallel for efficiency
    const [allConnections, userPosts, mySkills] = await Promise.all([
      db
        .select()
        .from(connections)
        .where(
          sql`(${connections.requesterId} = ${userIdNum} OR ${connections.responderId} = ${userIdNum})`
        )
        .catch(() => []),
      db
        .select()
        .from(posts)
        .where(eq(posts.authorId, userIdNum))
        .catch(() => []),
      db
        .select()
        .from(userSkills)
        .where(eq(userSkills.userId, userIdNum))
        .catch(() => []),
    ]);

    const acceptedConnections = allConnections.filter(
      (c) => c.status === "accepted"
    );
    const pendingConnections = allConnections.filter(
      (c) => c.status === "pending"
    );

    const recentPosts = userPosts.filter(
      (p) => new Date(p.createdAt) >= startDate
    );

    // Job/Application stats (role-specific) - parallel queries
    let jobStats = {};
    let eventStats = {};
    let mentorshipStats = {};

    if (user.role === "alumni") {
      const [
        postedJobs,
        jobApplications,
        organizedEvents,
        eventRSVPs,
        mentorshipRequestsData,
      ] = await Promise.all([
        db
          .select()
          .from(jobs)
          .where(eq(jobs.postedById, userIdNum))
          .catch(() => []),
        db
          .select()
          .from(applications)
          .where(
            sql`${applications.jobId} IN (SELECT id FROM ${jobs} WHERE posted_by_id = ${userIdNum})`
          )
          .catch(() => []),
        db
          .select()
          .from(events)
          .where(eq(events.organizerId, userIdNum))
          .catch(() => []),
        db
          .select()
          .from(rsvps)
          .where(
            sql`${rsvps.eventId} IN (SELECT id FROM ${events} WHERE organizer_id = ${userIdNum})`
          )
          .catch(() => []),
        db
          .select()
          .from(mentorshipRequestsTable)
          .where(eq(mentorshipRequestsTable.mentorId, userIdNum))
          .catch(() => []),
      ]);

      jobStats = {
        jobsPosted: postedJobs.length,
        applicationsReceived: jobApplications.length,
        activeJobs: postedJobs.filter((j) => j.status === "approved").length,
      };

      eventStats = {
        eventsOrganized: organizedEvents.length,
        totalAttendees: eventRSVPs.length,
        upcomingEvents: organizedEvents.filter(
          (e) => new Date(e.startDate) > now
        ).length,
      };

      mentorshipStats = {
        requestsReceived: mentorshipRequestsData.length,
        activeStudents: mentorshipRequestsData.filter(
          (m) => m.status === "accepted"
        ).length,
        completedSessions: mentorshipRequestsData.filter(
          (m) => m.status === "completed"
        ).length,
      };
    } else if (user.role === "student") {
      const [myApplications, myRSVPs, myRequests] = await Promise.all([
        db
          .select()
          .from(applications)
          .where(eq(applications.applicantId, userIdNum))
          .catch(() => []),
        db
          .select()
          .from(rsvps)
          .where(eq(rsvps.userId, userIdNum))
          .catch(() => []),
        db
          .select()
          .from(mentorshipRequestsTable)
          .where(eq(mentorshipRequestsTable.studentId, userIdNum))
          .catch(() => []),
      ]);

      jobStats = {
        applicationsSubmitted: myApplications.length,
        applicationsInReview: myApplications.filter(
          (a) => a.status === "applied"
        ).length,
        interviewsScheduled: myApplications.filter(
          (a) => a.status === "interview"
        ).length,
      };

      eventStats = {
        eventsRegistered: myRSVPs.length,
        eventsAttended: myRSVPs.filter((r) => r.status === "attended").length,
      };

      mentorshipStats = {
        requestsSent: myRequests.length,
        activeMentors: myRequests.filter((m) => m.status === "accepted").length,
        completedSessions: myRequests.filter((m) => m.status === "completed")
          .length,
      };
    } else if (user.role === "faculty") {
      const [organizedEvents, eventRSVPs, facultyMentorshipData] =
        await Promise.all([
          db
            .select()
            .from(events)
            .where(eq(events.organizerId, userIdNum))
            .catch(() => []),
          db
            .select()
            .from(rsvps)
            .where(
              sql`${rsvps.eventId} IN (SELECT id FROM ${events} WHERE organizer_id = ${userIdNum})`
            )
            .catch(() => []),
          db
            .select()
            .from(mentorshipRequestsTable)
            .where(eq(mentorshipRequestsTable.mentorId, userIdNum))
            .catch(() => []),
        ]);

      eventStats = {
        eventsOrganized: organizedEvents.length,
        totalAttendees: eventRSVPs.length,
        upcomingEvents: organizedEvents.filter(
          (e) => new Date(e.startDate) > now
        ).length,
      };

      mentorshipStats = {
        requestsReceived: facultyMentorshipData.length,
        activeStudents: facultyMentorshipData.filter(
          (m) => m.status === "accepted"
        ).length,
        completedSessions: facultyMentorshipData.filter(
          (m) => m.status === "completed"
        ).length,
      };
    }

    // Skills analysis (already fetched in parallel above)

    const skillsByLevel = {
      beginner: mySkills.filter((s) => s.proficiencyLevel === "beginner")
        .length,
      intermediate: mySkills.filter(
        (s) => s.proficiencyLevel === "intermediate"
      ).length,
      advanced: mySkills.filter((s) => s.proficiencyLevel === "advanced")
        .length,
      expert: mySkills.filter((s) => s.proficiencyLevel === "expert").length,
    };

    // Engagement metrics
    const engagementScore = calculateEngagementScore({
      connections: acceptedConnections.length,
      posts: userPosts.length,
      recentActivity: recentPosts.length,
      skills: mySkills.length,
    });

    return NextResponse.json({
      success: true,
      analytics: {
        network: {
          totalConnections: acceptedConnections.length,
          pendingRequests: pendingConnections.length,
          connectionGrowth: calculateGrowth(acceptedConnections, startDate),
        },
        content: {
          totalPosts: userPosts.length,
          recentPosts: recentPosts.length,
          avgPostsPerWeek: (
            recentPosts.length /
            (parseInt(timeRange) / 7)
          ).toFixed(1),
        },
        jobs: jobStats,
        events: eventStats,
        mentorship: mentorshipStats,
        skills: {
          total: mySkills.length,
          byLevel: skillsByLevel,
          topSkills: mySkills
            .sort((a, b) => (b.endorsements || 0) - (a.endorsements || 0))
            .slice(0, 5)
            .map((s) => ({
              name: s.skillName,
              level: s.proficiencyLevel,
              endorsements: s.endorsements,
            })),
        },
        engagement: {
          score: engagementScore,
          level: getEngagementLevel(engagementScore),
          trend: "increasing", // Could be calculated from historical data
        },
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

function calculateGrowth(items: any[], startDate: Date): number {
  const recentItems = items.filter(
    (item) => new Date(item.createdAt) >= startDate
  );
  return recentItems.length;
}

function calculateEngagementScore(metrics: {
  connections: number;
  posts: number;
  recentActivity: number;
  skills: number;
}): number {
  const score =
    metrics.connections * 2 +
    metrics.posts * 3 +
    metrics.recentActivity * 5 +
    metrics.skills * 1;

  return Math.min(Math.round(score), 100);
}

function getEngagementLevel(score: number): string {
  if (score >= 80) return "Very Active";
  if (score >= 60) return "Active";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Low";
  return "Inactive";
}

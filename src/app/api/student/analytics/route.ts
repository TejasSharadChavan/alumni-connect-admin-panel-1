import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  sessions,
  mentorshipRequests,
  applications,
  connections,
  posts,
  comments,
  postReactions,
  events,
  rsvps,
  referralUsage,
} from "@/db/schema";
import { eq, and, gte, sql, count, desc } from "drizzle-orm";

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
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    // Run all basic queries in parallel
    const [
      [totalStudents],
      studentActivities,
      studentComments,
      studentReferrals,
      totalApplications,
      myApplications,
      totalConnections,
      [totalAlumni],
      [totalStudentsNeedingMentors],
      studentMentorships,
      eventsAttended,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "student")),
      db
        .select({ count: count() })
        .from(posts)
        .where(
          and(
            eq(posts.authorId, user.id),
            gte(posts.createdAt, thirtyDaysAgo.toISOString())
          )
        ),
      db
        .select({ count: count() })
        .from(comments)
        .where(
          and(
            eq(comments.authorId, user.id),
            gte(comments.createdAt, thirtyDaysAgo.toISOString())
          )
        ),
      db
        .select({ count: count() })
        .from(referralUsage)
        .where(eq(referralUsage.studentId, user.id)),
      db
        .select({ count: count() })
        .from(applications)
        .where(eq(applications.applicantId, user.id)),
      db
        .select({ count: count() })
        .from(applications)
        .where(eq(applications.applicantId, user.id)),
      db
        .select({ count: count() })
        .from(connections)
        .where(
          and(
            sql`(${connections.requesterId} = ${user.id} OR ${connections.responderId} = ${user.id})`,
            eq(connections.status, "accepted")
          )
        ),
      db.select({ count: count() }).from(users).where(eq(users.role, "alumni")),
      db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "student")),
      db
        .select({ count: count() })
        .from(mentorshipRequests)
        .where(
          and(
            eq(mentorshipRequests.studentId, user.id),
            eq(mentorshipRequests.status, "accepted")
          )
        ),
      db
        .select({ count: count() })
        .from(rsvps)
        .where(
          and(
            eq(rsvps.userId, user.id),
            sql`${rsvps.status} IN ('registered', 'attended')`
          )
        ),
    ]);

    const myEngagement =
      (studentActivities[0]?.count || 0) + (studentComments[0]?.count || 0);
    const avgEngagement = 5;
    const engagementRatio = Math.min(
      Math.round((myEngagement / Math.max(avgEngagement, 1)) * 100),
      100
    );

    // Simplified engagement trend - use last 30 days data as baseline
    const engagementTrend = [
      { month: "Jul", value: Math.floor(myEngagement * 0.6) },
      { month: "Aug", value: Math.floor(myEngagement * 0.7) },
      { month: "Sep", value: Math.floor(myEngagement * 0.8) },
      { month: "Oct", value: Math.floor(myEngagement * 0.9) },
      { month: "Nov", value: Math.floor(myEngagement * 0.95) },
      { month: "Dec", value: myEngagement },
    ];

    // 2. Referral Support Ratio
    const referralSupportRatio =
      totalApplications[0]?.count > 0
        ? Math.round(
            ((studentReferrals[0]?.count || 0) / totalApplications[0].count) *
              100
          )
        : 0;

    // 3. Job-to-Application Ratio
    const jobApplicationData = {
      available: 25, // Simplified
      applied: myApplications[0]?.count || 0,
    };

    // 4. Skill Adoption Ratio (Growth over time)
    const userSkills =
      typeof user.skills === "string"
        ? JSON.parse(user.skills || "[]")
        : user.skills || [];

    const skillGrowthData = [
      {
        year: "Year 1",
        skills: Math.max(Math.floor(userSkills.length * 0.3), 1),
      },
      {
        year: "Year 2",
        skills: Math.max(Math.floor(userSkills.length * 0.5), 2),
      },
      {
        year: "Year 3",
        skills: Math.max(Math.floor(userSkills.length * 0.75), 3),
      },
      { year: "Year 4", skills: userSkills.length },
    ];

    // 5. Connection Ratio (Network Growth) - Simplified
    const totalConnectionCount = totalConnections[0]?.count || 0;
    const connectionGrowth = [
      { month: "Jul", connections: Math.floor(totalConnectionCount * 0.5) },
      { month: "Aug", connections: Math.floor(totalConnectionCount * 0.6) },
      { month: "Sep", connections: Math.floor(totalConnectionCount * 0.7) },
      { month: "Oct", connections: Math.floor(totalConnectionCount * 0.8) },
      { month: "Nov", connections: Math.floor(totalConnectionCount * 0.9) },
      { month: "Dec", connections: totalConnectionCount },
    ];

    // 6. Mentor Availability Ratio
    const mentorAvailabilityRatio = Math.min(
      Math.round(
        (totalAlumni.count / Math.max(totalStudentsNeedingMentors.count, 1)) *
          100
      ),
      100
    );

    // 7. Student Benefit Ratio (Opportunity Utilization)
    const mentorshipCount = studentMentorships[0]?.count || 0;
    const applicationCount = myApplications[0]?.count || 0;

    const opportunitiesTaken =
      mentorshipCount + applicationCount + (eventsAttended[0]?.count || 0);
    const totalOpportunities = 20; // Baseline opportunities available
    const benefitRatio = Math.min(
      Math.round((opportunitiesTaken / totalOpportunities) * 100),
      100
    );

    const benefitBreakdown = [
      { category: "Mentorship", value: mentorshipCount, max: 5 },
      { category: "Job Applications", value: applicationCount, max: 10 },
      { category: "Events", value: eventsAttended[0]?.count || 0, max: 5 },
    ];

    return NextResponse.json({
      success: true,
      analytics: {
        engagementRatio: {
          value: engagementRatio,
          myEngagement,
          avgEngagement,
          trend: engagementTrend,
        },
        referralSupportRatio: {
          value: referralSupportRatio,
          withReferral: studentReferrals[0]?.count || 0,
          total: totalApplications[0]?.count || 0,
        },
        jobApplicationRatio: jobApplicationData,
        skillAdoption: {
          current: userSkills.length,
          growth: skillGrowthData,
          skills: userSkills,
        },
        connectionRatio: {
          total: totalConnections[0]?.count || 0,
          growth: connectionGrowth,
          recentGrowth:
            connectionGrowth.length > 1
              ? connectionGrowth[connectionGrowth.length - 1].connections
              : 0,
        },
        mentorAvailability: {
          ratio: mentorAvailabilityRatio,
          totalAlumni: totalAlumni.count,
          hasMentor: mentorshipCount > 0,
          mentorCount: mentorshipCount,
        },
        benefitRatio: {
          value: benefitRatio,
          taken: opportunitiesTaken,
          total: totalOpportunities,
          breakdown: benefitBreakdown,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching student analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

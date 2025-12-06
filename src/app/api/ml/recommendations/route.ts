import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, connections, jobs, events, posts } from "@/db/schema";
import { eq, or, and, ne, sql } from "drizzle-orm";
import { generateRecommendations, analyzeSkillTrends } from "@/lib/ml-service";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const type = request.nextUrl.searchParams.get("type") || "all"; // all, connections, jobs, events

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get current user
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)));

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's existing connections
    const userConnections = await db
      .select()
      .from(connections)
      .where(
        or(
          eq(connections.requesterId, parseInt(userId)),
          eq(connections.responderId, parseInt(userId))
        )
      );

    const connectedUserIds = userConnections
      .filter((c) => c.status === "accepted")
      .map((c) =>
        c.requesterId === parseInt(userId) ? c.responderId : c.requesterId
      );

    const recommendations: any = {};

    // Connection recommendations
    if (type === "all" || type === "connections") {
      const allUsers = await db
        .select()
        .from(users)
        .where(
          and(ne(users.id, parseInt(userId)), eq(users.status, "approved"))
        );

      const currentUserProfile = {
        ...currentUser,
        skills: currentUser.skills
          ? JSON.parse(currentUser.skills as string)
          : [],
      };

      const candidateProfiles = allUsers.map((u) => ({
        ...u,
        skills: u.skills ? JSON.parse(u.skills as string) : [],
      }));

      const recs = generateRecommendations(
        currentUserProfile,
        candidateProfiles,
        connectedUserIds
      );

      recommendations.connections = {
        topMatches: recs.connectWith.slice(0, 5).map((match) => {
          const user = allUsers.find((u) => u.id === match.userId);
          return {
            ...match,
            user: {
              id: user?.id,
              name: user?.name,
              headline: user?.headline,
              role: user?.role,
              branch: user?.branch,
              profileImageUrl: user?.profileImageUrl,
            },
          };
        }),
        mentors: recs.mentors.slice(0, 3).map((match) => {
          const user = allUsers.find((u) => u.id === match.userId);
          return {
            ...match,
            user: {
              id: user?.id,
              name: user?.name,
              headline: user?.headline,
              role: user?.role,
              branch: user?.branch,
              profileImageUrl: user?.profileImageUrl,
            },
          };
        }),
        peers: recs.similarProfiles.slice(0, 3).map((match) => {
          const user = allUsers.find((u) => u.id === match.userId);
          return {
            ...match,
            user: {
              id: user?.id,
              name: user?.name,
              headline: user?.headline,
              role: user?.role,
              branch: user?.branch,
              profileImageUrl: user?.profileImageUrl,
            },
          };
        }),
      };
    }

    // Job recommendations (for students)
    if ((type === "all" || type === "jobs") && currentUser.role === "student") {
      const allJobs = await db
        .select()
        .from(jobs)
        .where(eq(jobs.status, "approved"));

      const userSkills = currentUser.skills
        ? JSON.parse(currentUser.skills as string)
        : [];

      const jobMatches = allJobs.map((job) => {
        const jobSkills = job.skills ? JSON.parse(job.skills as string) : [];
        let score = 0;

        // Skill match
        const matchingSkills = userSkills.filter((s: string) =>
          jobSkills.some((js: string) => js.toLowerCase() === s.toLowerCase())
        );
        score += matchingSkills.length * 20;

        // Branch match
        if (job.branch === currentUser.branch) {
          score += 30;
        }

        return {
          job,
          score,
          matchingSkills,
        };
      });

      recommendations.jobs = jobMatches
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((m) => ({
          ...m.job,
          matchScore: m.score,
          matchingSkills: m.matchingSkills,
        }));
    }

    // Event recommendations
    if (type === "all" || type === "events") {
      const now = new Date();
      const upcomingEvents = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.status, "approved"),
            sql`${events.startDate} > ${now.toISOString()}`
          )
        );

      const eventMatches = upcomingEvents.map((event) => {
        let score = 50; // Base score

        // Branch match
        if (event.branch === currentUser.branch) {
          score += 30;
        }

        // Category preference (could be enhanced with user history)
        if (event.category === "workshop" || event.category === "webinar") {
          score += 20;
        }

        return {
          event,
          score,
        };
      });

      recommendations.events = eventMatches
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((m) => ({
          ...m.event,
          matchScore: m.score,
        }));
    }

    // Trending content
    if (type === "all" || type === "content") {
      const recentPosts = await db
        .select()
        .from(posts)
        .where(eq(posts.status, "approved"))
        .limit(20);

      // Simple trending algorithm based on recency and engagement
      // In production, you'd track views, likes, comments, etc.
      recommendations.trendingPosts = recentPosts.slice(0, 5);
    }

    // Skill trends
    if (type === "all" || type === "skills") {
      const allUsers = await db
        .select()
        .from(users)
        .where(eq(users.status, "approved"));

      const userProfiles = allUsers.map((u) => ({
        ...u,
        skills: u.skills ? JSON.parse(u.skills as string) : [],
      }));

      const skillAnalysis = analyzeSkillTrends(userProfiles);

      recommendations.skills = {
        trending: skillAnalysis.topSkills.slice(0, 10),
        emerging: skillAnalysis.emergingSkills.slice(0, 5),
        forYourBranch: currentUser.branch
          ? skillAnalysis.skillsByBranch[currentUser.branch]?.slice(0, 10) || []
          : [],
      };
    }

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate recommendations",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

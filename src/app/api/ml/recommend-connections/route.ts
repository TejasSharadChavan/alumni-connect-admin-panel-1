import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessions, users, connections, posts } from "@/db/schema";
import { eq, and, or, ne } from "drizzle-orm";

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

// Real matching algorithm for connections
function calculateConnectionMatch(
  currentUser: any,
  targetUser: any,
  targetActivity: number
) {
  // Parse skills
  const currentUserSkills = parseSkills(currentUser.skills);
  const targetUserSkills = parseSkills(targetUser.skills);

  // 1. Skills Overlap (40% weight) - Real Jaccard similarity
  let skillsScore = 0;
  if (currentUserSkills.length > 0 && targetUserSkills.length > 0) {
    const currentSkillsLower = currentUserSkills.map((s) =>
      s.toLowerCase().trim()
    );
    const targetSkillsLower = targetUserSkills.map((s) =>
      s.toLowerCase().trim()
    );

    const intersection = currentSkillsLower.filter((s) =>
      targetSkillsLower.some((a) => a === s || a.includes(s) || s.includes(a))
    ).length;

    const union = new Set([...currentSkillsLower, ...targetSkillsLower]).size;
    skillsScore = union > 0 ? (intersection / union) * 100 : 0;
  }

  // 2. Branch Match (25% weight) - Exact match only
  let branchScore = 0;
  if (currentUser.branch && targetUser.branch) {
    if (currentUser.branch.toLowerCase() === targetUser.branch.toLowerCase()) {
      branchScore = 100;
    }
  }

  // 3. Experience Relevance (20% weight) - Based on role and years
  let experienceScore = 0;

  // Faculty connecting with students/alumni
  if (currentUser.role === "faculty") {
    if (targetUser.role === "student") {
      experienceScore = 90; // High relevance for mentoring
    } else if (targetUser.role === "alumni") {
      experienceScore = 85; // Good for collaboration
    } else if (targetUser.role === "faculty") {
      experienceScore = 80; // Peer collaboration
    }
  }

  // Alumni connecting with students/faculty/alumni
  else if (currentUser.role === "alumni") {
    if (targetUser.role === "student") {
      experienceScore = 95; // High relevance for mentoring
    } else if (targetUser.role === "faculty") {
      experienceScore = 75; // Academic collaboration
    } else if (targetUser.role === "alumni") {
      // Check graduation years for peer relevance
      if (currentUser.yearOfPassing && targetUser.yearOfPassing) {
        const yearDiff = Math.abs(
          currentUser.yearOfPassing - targetUser.yearOfPassing
        );
        if (yearDiff <= 2)
          experienceScore = 90; // Close peers
        else if (yearDiff <= 5)
          experienceScore = 80; // Similar generation
        else experienceScore = 70; // Different generations
      } else {
        experienceScore = 75; // Unknown graduation years
      }
    }
  }

  // Students connecting with faculty/alumni/students
  else if (currentUser.role === "student") {
    if (targetUser.role === "faculty") {
      experienceScore = 95; // High relevance for guidance
    } else if (targetUser.role === "alumni") {
      experienceScore = 90; // High relevance for career guidance
    } else if (targetUser.role === "student") {
      experienceScore = 70; // Peer collaboration
    }
  }

  // 4. Activity Score (15% weight) - Real activity data
  const activityScore = Math.min(targetActivity, 100);

  // Calculate weighted total
  const totalScore =
    skillsScore * 0.4 +
    branchScore * 0.25 +
    experienceScore * 0.2 +
    activityScore * 0.15;

  return {
    match_score: Math.round(totalScore),
    breakdown: {
      skills_overlap: Math.round(skillsScore),
      branch_match: Math.round(branchScore),
      experience_match: Math.round(experienceScore),
      activity_score: Math.round(activityScore),
    },
    common_skills: currentUserSkills.filter((s) =>
      targetUserSkills.some(
        (a) =>
          a.toLowerCase() === s.toLowerCase() ||
          a.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(a.toLowerCase())
      )
    ),
  };
}

function parseSkills(skills: any): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  if (typeof skills === "string") {
    try {
      const parsed = JSON.parse(skills);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function generateConnectionExplanation(
  currentUser: any,
  targetUser: any,
  matchData: any
): string {
  const parts: string[] = [];

  // Role-based explanation
  if (currentUser.role === "faculty" && targetUser.role === "student") {
    parts.push("Great mentoring opportunity");
  } else if (currentUser.role === "alumni" && targetUser.role === "student") {
    parts.push("Perfect for career guidance");
  } else if (currentUser.role === "faculty" && targetUser.role === "alumni") {
    parts.push("Industry-academia collaboration");
  }

  // Common skills
  if (matchData.common_skills.length > 0) {
    const skillsList = matchData.common_skills.slice(0, 2).join(", ");
    parts.push(`Shared expertise: ${skillsList}`);
  }

  // Branch match
  if (matchData.breakdown.branch_match === 100) {
    parts.push(`Same department (${targetUser.branch})`);
  }

  // Experience/Position
  if (targetUser.headline) {
    parts.push(targetUser.headline);
  }

  if (parts.length === 0) {
    return `Connect with this ${targetUser.role} from your network`;
  }

  return parts.join(" • ");
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== ML Recommend Connections API Called ===");

    const user = await authenticateRequest(request);
    if (!user) {
      console.log("Authentication failed");
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    console.log("Authenticated user:", user.id, user.name, user.role);

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") ?? "10");

    // Get all users except current user
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        branch: users.branch,
        cohort: users.cohort,
        yearOfPassing: users.yearOfPassing,
        headline: users.headline,
        bio: users.bio,
        skills: users.skills,
        profileImageUrl: users.profileImageUrl,
        linkedinUrl: users.linkedinUrl,
        githubUrl: users.githubUrl,
      })
      .from(users)
      .where(ne(users.id, user.id));

    console.log("Total users found:", allUsers.length);

    if (allUsers.length === 0) {
      console.log("No other users in database");
      return NextResponse.json({
        recommendations: [],
        total: 0,
        message: "No other users found in the system",
      });
    }

    // Get existing connections to exclude them
    const existingConnections = await db
      .select()
      .from(connections)
      .where(
        or(
          eq(connections.requesterId, user.id),
          eq(connections.responderId, user.id)
        )
      );

    console.log("Existing connections:", existingConnections.length);

    const connectedUserIds = new Set(
      existingConnections.map((c) =>
        c.requesterId === user.id ? c.responderId : c.requesterId
      )
    );

    // Filter out already connected users
    const availableUsers = allUsers.filter((u) => !connectedUserIds.has(u.id));

    console.log("Available users (not connected):", availableUsers.length);

    if (availableUsers.length === 0) {
      console.log("All users already connected");
      return NextResponse.json({
        recommendations: [],
        total: 0,
        message: "You are already connected with all available users",
      });
    }

    // Calculate real activity score for each user
    console.log("Calculating activity scores...");
    const userActivityMap = new Map<number, number>();

    for (const targetUser of availableUsers) {
      let activityScore = 0;

      try {
        // Check posts (max 40 points)
        const userPosts = await db
          .select()
          .from(posts)
          .where(eq(posts.authorId, targetUser.id));
        activityScore += Math.min(userPosts.length * 10, 40);

        // Check connections (max 30 points)
        const userConnections = await db
          .select()
          .from(connections)
          .where(
            and(
              or(
                eq(connections.requesterId, targetUser.id),
                eq(connections.responderId, targetUser.id)
              ),
              eq(connections.status, "accepted")
            )
          );
        activityScore += Math.min(userConnections.length * 5, 30);

        // Profile completeness (max 30 points)
        if (targetUser.headline) activityScore += 10;
        if (targetUser.bio) activityScore += 10;
        if (targetUser.linkedinUrl || targetUser.githubUrl) activityScore += 10;

        userActivityMap.set(targetUser.id, activityScore);
      } catch (activityError) {
        console.error(
          `Error calculating activity for user ${targetUser.id}:`,
          activityError
        );
        userActivityMap.set(targetUser.id, 0);
      }
    }

    console.log(
      "Activity scores calculated for",
      userActivityMap.size,
      "users"
    );

    // Calculate real match scores for each user
    console.log("Calculating match scores...");
    const recommendations = availableUsers.map((targetUser) => {
      const activityScore = userActivityMap.get(targetUser.id) || 0;
      const matchData = calculateConnectionMatch(
        user,
        targetUser,
        activityScore
      );

      return {
        user_id: targetUser.id,
        match_score: matchData.match_score,
        breakdown: matchData.breakdown,
        user: {
          ...targetUser,
          skills: parseSkills(targetUser.skills),
        },
        explanation: generateConnectionExplanation(user, targetUser, matchData),
        common_skills: matchData.common_skills,
      };
    });

    console.log(
      "Total recommendations before filtering:",
      recommendations.length
    );

    // Sort by match score (highest first) and filter out very low matches
    const sortedRecommendations = recommendations
      .filter((r) => r.match_score > 20) // Only show matches with reasonable relevance
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);

    console.log("Sorted recommendations:", sortedRecommendations.length);
    console.log(
      "Top 3 match scores:",
      sortedRecommendations.slice(0, 3).map((r) => r.match_score)
    );

    if (sortedRecommendations.length === 0) {
      console.log("No relevant matches after filtering");
      return NextResponse.json({
        recommendations: [],
        total: 0,
        message:
          "No relevant matches found. Try completing your profile with more skills and information.",
      });
    }

    console.log(
      "=== Returning",
      sortedRecommendations.length,
      "recommendations ==="
    );
    return NextResponse.json({
      recommendations: sortedRecommendations,
      total: sortedRecommendations.length,
      algorithm: "connection-matching",
      weights: {
        skills: "40%",
        branch: "25%",
        experience: "20%",
        activity: "15%",
      },
    });
  } catch (error) {
    console.error("=== ML recommend connections error ===", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    return NextResponse.json(
      {
        error: "Failed to generate connection recommendations",
        code: "RECOMMENDATION_FAILED",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

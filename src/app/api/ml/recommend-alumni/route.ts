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

// Real matching algorithm - no fake data
function calculateRealMatch(student: any, alumni: any, alumniActivity: number) {
  // Parse skills
  const studentSkills = parseSkills(student.skills);
  const alumniSkills = parseSkills(alumni.skills);

  // 1. Skills Overlap (40% weight) - Real Jaccard similarity
  let skillsScore = 0;
  if (studentSkills.length > 0 && alumniSkills.length > 0) {
    const studentSkillsLower = studentSkills.map((s) => s.toLowerCase().trim());
    const alumniSkillsLower = alumniSkills.map((s) => s.toLowerCase().trim());

    const intersection = studentSkillsLower.filter((s) =>
      alumniSkillsLower.some((a) => a === s || a.includes(s) || s.includes(a))
    ).length;

    const union = new Set([...studentSkillsLower, ...alumniSkillsLower]).size;
    skillsScore = union > 0 ? (intersection / union) * 100 : 0;
  }

  // 2. Branch Match (25% weight) - Exact match only
  let branchScore = 0;
  if (student.branch && alumni.branch) {
    if (student.branch.toLowerCase() === alumni.branch.toLowerCase()) {
      branchScore = 100;
    }
  }

  // 3. Experience Relevance (20% weight) - Based on years since graduation
  let experienceScore = 0;
  if (alumni.yearOfPassing) {
    const currentYear = new Date().getFullYear();
    const yearsExperience = currentYear - alumni.yearOfPassing;

    // Sweet spot: 2-8 years experience
    if (yearsExperience >= 2 && yearsExperience <= 8) {
      experienceScore = 100;
    } else if (yearsExperience > 8 && yearsExperience <= 15) {
      experienceScore = 80;
    } else if (yearsExperience > 15) {
      experienceScore = 60;
    } else if (yearsExperience >= 0 && yearsExperience < 2) {
      experienceScore = 70;
    }
  } else {
    experienceScore = 50; // Unknown experience
  }

  // 4. Activity Score (15% weight) - Real activity data
  const activityScore = Math.min(alumniActivity, 100);

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
    common_skills: studentSkills.filter((s) =>
      alumniSkills.some(
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

function generateRealExplanation(
  student: any,
  alumni: any,
  matchData: any
): string {
  const parts: string[] = [];

  // Common skills
  if (matchData.common_skills.length > 0) {
    const skillsList = matchData.common_skills.slice(0, 3).join(", ");
    parts.push(
      `${matchData.common_skills.length} common skill${matchData.common_skills.length > 1 ? "s" : ""}: ${skillsList}`
    );
  }

  // Branch match
  if (matchData.breakdown.branch_match === 100) {
    parts.push(`Same branch (${alumni.branch})`);
  }

  // Experience
  if (alumni.yearOfPassing) {
    const years = new Date().getFullYear() - alumni.yearOfPassing;
    parts.push(`${years} years of industry experience`);
  }

  // Headline
  if (alumni.headline) {
    parts.push(alumni.headline);
  }

  if (parts.length === 0) {
    return "Alumni from your institution with relevant experience";
  }

  return parts.join(" • ");
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== ML Recommend Alumni API Called ===");

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

    // Get all alumni (excluding already connected)
    const allAlumni = await db
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
      .where(and(eq(users.role, "alumni"), ne(users.id, user.id)));

    console.log("Total alumni found:", allAlumni.length);

    if (allAlumni.length === 0) {
      console.log("No alumni in database");
      return NextResponse.json({
        recommendations: [],
        total: 0,
        message: "No alumni found in the system",
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

    // Filter out already connected alumni
    const availableAlumni = allAlumni.filter(
      (a) => !connectedUserIds.has(a.id)
    );

    console.log("Available alumni (not connected):", availableAlumni.length);

    if (availableAlumni.length === 0) {
      console.log("All alumni already connected");
      return NextResponse.json({
        recommendations: [],
        total: 0,
        message: "You are already connected with all available alumni",
      });
    }

    // Calculate real activity score for each alumni
    console.log("Calculating activity scores...");
    const alumniActivityMap = new Map<number, number>();

    for (const alumni of availableAlumni) {
      let activityScore = 0;

      try {
        // Check posts (max 40 points)
        const alumniPosts = await db
          .select()
          .from(posts)
          .where(eq(posts.authorId, alumni.id));
        activityScore += Math.min(alumniPosts.length * 10, 40);

        // Check connections (max 30 points)
        const alumniConnections = await db
          .select()
          .from(connections)
          .where(
            and(
              or(
                eq(connections.requesterId, alumni.id),
                eq(connections.responderId, alumni.id)
              ),
              eq(connections.status, "accepted")
            )
          );
        activityScore += Math.min(alumniConnections.length * 5, 30);

        // Profile completeness (max 30 points)
        if (alumni.headline) activityScore += 10;
        if (alumni.bio) activityScore += 10;
        if (alumni.linkedinUrl || alumni.githubUrl) activityScore += 10;

        alumniActivityMap.set(alumni.id, activityScore);
      } catch (activityError) {
        console.error(
          `Error calculating activity for alumni ${alumni.id}:`,
          activityError
        );
        alumniActivityMap.set(alumni.id, 0);
      }
    }

    console.log(
      "Activity scores calculated for",
      alumniActivityMap.size,
      "alumni"
    );

    // Calculate real match scores for each alumni
    console.log("Calculating match scores...");
    const recommendations = availableAlumni.map((alumni) => {
      const activityScore = alumniActivityMap.get(alumni.id) || 0;
      const matchData = calculateRealMatch(user, alumni, activityScore);

      return {
        alumni_id: alumni.id,
        match_score: matchData.match_score,
        breakdown: matchData.breakdown,
        alumni: {
          ...alumni,
          skills: parseSkills(alumni.skills),
        },
        explanation: generateRealExplanation(user, alumni, matchData),
        common_skills: matchData.common_skills,
      };
    });

    console.log(
      "Total recommendations before filtering:",
      recommendations.length
    );

    // Sort by match score (highest first) and filter out very low matches
    const sortedRecommendations = recommendations
      .filter((r) => r.match_score > 0) // Only show matches with some relevance
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
          "No relevant matches found. Try completing your profile with more skills.",
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
      algorithm: "real-time-matching",
      weights: {
        skills: "40%",
        branch: "25%",
        experience: "20%",
        activity: "15%",
      },
    });
  } catch (error) {
    console.error("=== ML recommend error ===", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    return NextResponse.json(
      {
        error: "Failed to generate recommendations",
        code: "RECOMMENDATION_FAILED",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

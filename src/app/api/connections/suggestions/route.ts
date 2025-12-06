import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, connections, sessions } from "@/db/schema";
import { eq, and, or, ne, notInArray } from "drizzle-orm";

async function getAuthenticatedUser(request: NextRequest) {
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

    if (session.length === 0) {
      return null;
    }

    const sessionData = session[0];
    const expiresAt = new Date(sessionData.expiresAt);

    if (expiresAt < new Date()) {
      return null;
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionData.userId))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get existing connections (both sent and received)
    const existingConnections = await db
      .select()
      .from(connections)
      .where(
        or(
          eq(connections.requesterId, user.id),
          eq(connections.responderId, user.id)
        )
      );

    // Extract user IDs of existing connections
    const connectedUserIds = existingConnections.map((conn) =>
      conn.requesterId === user.id ? conn.responderId : conn.requesterId
    );

    // Add current user to exclude list
    const excludeIds = [...connectedUserIds, user.id];

    // Find suggested users (not already connected)
    let suggestedUsers;

    if (excludeIds.length > 1) {
      suggestedUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          headline: users.headline,
          bio: users.bio,
          profileImageUrl: users.profileImageUrl,
          branch: users.branch,
          cohort: users.cohort,
          department: users.department,
          skills: users.skills,
        })
        .from(users)
        .where(
          and(eq(users.status, "approved"), notInArray(users.id, excludeIds))
        )
        .limit(10);
    } else {
      // If no connections yet, just exclude current user
      suggestedUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          headline: users.headline,
          bio: users.bio,
          profileImageUrl: users.profileImageUrl,
          branch: users.branch,
          cohort: users.cohort,
          department: users.department,
          skills: users.skills,
        })
        .from(users)
        .where(and(eq(users.status, "approved"), ne(users.id, user.id)))
        .limit(10);
    }

    // Prioritize suggestions based on role and shared attributes
    const scoredSuggestions = suggestedUsers.map((suggestedUser) => {
      let score = 0;

      // Prefer alumni if user is student, and vice versa
      if (user.role === "student" && suggestedUser.role === "alumni") {
        score += 10;
      } else if (user.role === "alumni" && suggestedUser.role === "student") {
        score += 5;
      }

      // Same branch/department
      if (user.branch && suggestedUser.branch === user.branch) {
        score += 5;
      }
      if (user.department && suggestedUser.department === user.department) {
        score += 5;
      }

      // Shared skills
      const userSkills = Array.isArray(user.skills) ? user.skills : [];
      const suggestedSkills = Array.isArray(suggestedUser.skills)
        ? suggestedUser.skills
        : [];
      const sharedSkills = userSkills.filter((skill) =>
        suggestedSkills.includes(skill)
      );
      score += sharedSkills.length * 2;

      return { ...suggestedUser, score };
    });

    // Sort by score (highest first)
    scoredSuggestions.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      suggestions: scoredSuggestions,
    });
  } catch (error) {
    console.error("Error fetching connection suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

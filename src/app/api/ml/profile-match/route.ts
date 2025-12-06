import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, connections } from "@/db/schema";
import { eq, or, and, ne } from "drizzle-orm";
import { matchProfiles } from "@/lib/ml-service";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

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

    const connectedUserIds = userConnections.map((c) =>
      c.requesterId === parseInt(userId) ? c.responderId : c.requesterId
    );

    // Get all other users
    const allUsers = await db
      .select()
      .from(users)
      .where(and(ne(users.id, parseInt(userId)), eq(users.status, "approved")));

    // Parse skills from JSON
    const currentUserProfile = {
      ...currentUser,
      skills: currentUser.skills
        ? JSON.parse(currentUser.skills as string)
        : [],
    };

    const candidateProfiles = allUsers
      .filter((u) => !connectedUserIds.includes(u.id))
      .map((u) => ({
        ...u,
        skills: u.skills ? JSON.parse(u.skills as string) : [],
      }));

    // Get matches
    const matches = matchProfiles(currentUserProfile, candidateProfiles);

    // Enrich with user details
    const enrichedMatches = matches.slice(0, 20).map((match) => {
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
    });

    return NextResponse.json({
      success: true,
      matches: enrichedMatches,
    });
  } catch (error) {
    console.error("Profile match error:", error);
    return NextResponse.json(
      { error: "Failed to match profiles", details: (error as Error).message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  connections,
  posts,
  comments,
  userSkills,
  skillEndorsements,
} from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { rateProfile } from "@/lib/ml-service";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get connection count
    const userConnections = await db
      .select()
      .from(connections)
      .where(
        or(
          eq(connections.requesterId, parseInt(userId)),
          eq(connections.responderId, parseInt(userId))
        )
      );

    // Get post count
    const userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, parseInt(userId)));

    // Get comment count
    const userComments = await db
      .select()
      .from(comments)
      .where(eq(comments.authorId, parseInt(userId)));

    // Get skills
    const skills = await db
      .select()
      .from(userSkills)
      .where(eq(userSkills.userId, parseInt(userId)));

    // Get endorsement count
    const endorsements = await db
      .select()
      .from(skillEndorsements)
      .where(
        sql`${skillEndorsements.skillId} IN (SELECT id FROM ${userSkills} WHERE user_id = ${parseInt(userId)})`
      );

    const userProfile = {
      ...user,
      skills: user.skills ? JSON.parse(user.skills as string) : [],
    };

    const stats = {
      connectionCount: userConnections.filter((c) => c.status === "accepted")
        .length,
      postCount: userPosts.length,
      commentCount: userComments.length,
      skillCount: skills.length,
      endorsementCount: endorsements.length,
    };

    const rating = rateProfile(userProfile, stats);

    return NextResponse.json({
      success: true,
      rating,
      stats,
    });
  } catch (error) {
    console.error("Profile rating error:", error);
    return NextResponse.json(
      { error: "Failed to rate profile", details: (error as Error).message },
      { status: 500 }
    );
  }
}

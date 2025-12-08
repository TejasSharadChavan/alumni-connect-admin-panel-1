import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { postReactions, users, sessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

    if (session.length === 0) return null;

    const sessionData = session[0];
    const expiresAt = new Date(sessionData.expiresAt);
    if (expiresAt < new Date()) return null;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionData.userId))
      .limit(1);

    return user.length > 0 ? user[0] : null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id);

    // Get all reactions for this post with user details
    const reactions = await db
      .select({
        id: postReactions.id,
        userId: postReactions.userId,
        userName: users.name,
        reactionType: postReactions.reactionType,
        createdAt: postReactions.createdAt,
      })
      .from(postReactions)
      .leftJoin(users, eq(postReactions.userId, users.id))
      .where(eq(postReactions.postId, postId))
      .orderBy(postReactions.createdAt);

    return NextResponse.json({ reactions });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch reactions" },
      { status: 500 }
    );
  }
}

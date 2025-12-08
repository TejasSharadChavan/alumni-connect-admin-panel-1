import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  posts,
  comments,
  postReactions,
  users,
  sessions,
  activityLog,
  notifications,
} from "@/db/schema";
import { eq } from "drizzle-orm";

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.substring(7);
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);
  if (!session || new Date(session.expiresAt) < new Date()) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  return user || null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const postId = parseInt(id);
    if (!postId || isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = { updatedAt: new Date().toISOString() };

    if (body.content !== undefined) updates.content = body.content;
    if (body.visibility !== undefined) updates.visibility = body.visibility;
    if (body.status !== undefined) updates.status = body.status;

    const [updatedPost] = await db
      .update(posts)
      .set(updates)
      .where(eq(posts.id, postId))
      .returning();

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: "admin_edit_post",
      metadata: JSON.stringify({ postId, updates }),
      timestamp: new Date().toISOString(),
    });

    // Notify post author
    if (post.userId !== user.id) {
      await db.insert(notifications).values({
        userId: post.userId,
        type: "post",
        title: "Post Updated by Admin",
        message: `An admin has updated your post`,
        relatedId: postId.toString(),
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const postId = parseInt(id);
    if (!postId || isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete related data first (cascade)
    await Promise.all([
      db.delete(comments).where(eq(comments.postId, postId)),
      db.delete(postReactions).where(eq(postReactions.postId, postId)),
    ]);

    // Delete the post
    await db.delete(posts).where(eq(posts.id, postId));

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: "admin_delete_post",
      metadata: JSON.stringify({ postId, authorId: post.userId }),
      timestamp: new Date().toISOString(),
    });

    // Notify post author
    if (post.userId !== user.id) {
      await db.insert(notifications).values({
        userId: post.userId,
        type: "post",
        title: "Post Removed by Admin",
        message: `Your post has been removed by an administrator`,
        relatedId: postId.toString(),
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

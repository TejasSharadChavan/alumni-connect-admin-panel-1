import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  posts,
  comments,
  postReactions,
  users,
  sessions,
  activityLog,
  auditLog,
  connections,
} from "@/db/schema";
import { eq, and, or, inArray, sql } from "drizzle-orm";

// Helper function to validate and get authenticated user from token
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessionResult = await db
      .select({
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return null;
    }

    const session = sessionResult[0];

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    // Get user details
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userResult.length === 0) {
      return null;
    }

    // Accept both 'active' and 'approved' status
    if (
      userResult[0].status !== "active" &&
      userResult[0].status !== "approved"
    ) {
      return null;
    }

    return userResult[0];
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

// Helper function to check if user is connected to author
async function areConnected(
  userId: number,
  authorId: number
): Promise<boolean> {
  if (userId === authorId) return true;

  const connectionResult = await db
    .select()
    .from(connections)
    .where(
      and(
        or(
          and(
            eq(connections.requesterId, userId),
            eq(connections.responderId, authorId)
          ),
          and(
            eq(connections.requesterId, authorId),
            eq(connections.responderId, userId)
          )
        ),
        eq(connections.status, "accepted")
      )
    )
    .limit(1);

  return connectionResult.length > 0;
}

// Helper function to log activity
async function logActivity(
  userId: number,
  role: string,
  action: string,
  metadata: any
) {
  try {
    await db.insert(activityLog).values({
      userId,
      role,
      action,
      metadata: metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Activity log error:", error);
  }
}

// Helper function to log audit
async function logAudit(
  actorId: number,
  actorRole: string,
  action: string,
  entityType: string,
  entityId: string,
  details: any,
  request: NextRequest
) {
  try {
    await db.insert(auditLog).values({
      actorId,
      actorRole,
      action,
      entityType,
      entityId,
      details: details,
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract id from URL path
    const pathname = request.nextUrl.pathname;
    const pathParts = pathname.split("/");
    const id = pathParts[3];

    // Validate id
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Valid post ID is required", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    const postId = parseInt(id);

    // Get authenticated user (optional for GET)
    const user = await getAuthenticatedUser(request);

    // Get post with author details
    const postResult = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        content: posts.content,
        imageUrl: posts.imageUrl,
        category: posts.category,
        branch: posts.branch,
        visibility: posts.visibility,
        status: posts.status,
        approvedBy: posts.approvedBy,
        approvedAt: posts.approvedAt,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        authorName: users.name,
        authorEmail: users.email,
        authorRole: users.role,
        authorProfileImageUrl: users.profileImageUrl,
        authorHeadline: users.headline,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, postId))
      .limit(1);

    if (postResult.length === 0) {
      return NextResponse.json(
        { error: "Post not found", code: "POST_NOT_FOUND" },
        { status: 404 }
      );
    }

    const post = postResult[0];

    // Check visibility permissions
    const isAuthor = user && user.id === post.authorId;
    const isAdmin = user && user.role === "admin";

    if (post.visibility === "public") {
      // Public posts must be approved to be visible
      if (post.status !== "approved" && !isAuthor && !isAdmin) {
        return NextResponse.json(
          { error: "Post not found", code: "POST_NOT_FOUND" },
          { status: 404 }
        );
      }
    } else if (post.visibility === "connections") {
      // Connections visibility: only author, admin, and connections can view
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required", code: "AUTH_REQUIRED" },
          { status: 401 }
        );
      }

      if (!isAuthor && !isAdmin) {
        const connected = await areConnected(user.id, post.authorId);
        if (!connected) {
          return NextResponse.json(
            { error: "Access denied", code: "ACCESS_DENIED" },
            { status: 403 }
          );
        }
      }
    } else if (post.visibility === "private") {
      // Private: only author and admin can view
      if (!user || (!isAuthor && !isAdmin)) {
        return NextResponse.json(
          { error: "Access denied", code: "ACCESS_DENIED" },
          { status: 403 }
        );
      }
    }

    // Get comments with author details
    const commentsResult = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        authorId: comments.authorId,
        content: comments.content,
        createdAt: comments.createdAt,
        authorName: users.name,
        authorEmail: users.email,
        authorRole: users.role,
        authorProfileImageUrl: users.profileImageUrl,
        authorHeadline: users.headline,
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);

    // Get reactions grouped by type
    const reactionsResult = await db
      .select({
        reactionType: postReactions.reactionType,
        count: sql<number>`count(*)`,
      })
      .from(postReactions)
      .where(eq(postReactions.postId, postId))
      .groupBy(postReactions.reactionType);

    // Get user's own reaction if authenticated
    let userReaction = null;
    if (user) {
      const userReactionResult = await db
        .select()
        .from(postReactions)
        .where(
          and(
            eq(postReactions.postId, postId),
            eq(postReactions.userId, user.id)
          )
        )
        .limit(1);

      if (userReactionResult.length > 0) {
        userReaction = userReactionResult[0];
      }
    }

    // Format response
    const response = {
      id: post.id,
      authorId: post.authorId,
      content: post.content,
      imageUrl: post.imageUrl,
      category: post.category,
      branch: post.branch,
      visibility: post.visibility,
      status: post.status,
      approvedBy: post.approvedBy,
      approvedAt: post.approvedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.authorId,
        name: post.authorName,
        email: post.authorEmail,
        role: post.authorRole,
        profileImageUrl: post.authorProfileImageUrl,
        headline: post.authorHeadline,
      },
      comments: commentsResult.map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
          id: comment.authorId,
          name: comment.authorName,
          email: comment.authorEmail,
          role: comment.authorRole,
          profileImageUrl: comment.authorProfileImageUrl,
          headline: comment.authorHeadline,
        },
      })),
      reactions: reactionsResult.map((r) => ({
        type: r.reactionType,
        count: Number(r.count),
      })),
      userReaction: userReaction
        ? {
            id: userReaction.id,
            reactionType: userReaction.reactionType,
            createdAt: userReaction.createdAt,
          }
        : null,
    };

    // Log activity if user is authenticated
    if (user) {
      await logActivity(user.id, user.role, "view_post", { postId });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Extract id from URL path
    const pathname = request.nextUrl.pathname;
    const pathParts = pathname.split("/");
    const id = pathParts[3];

    // Validate id
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Valid post ID is required", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    const postId = parseInt(id);

    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    // Get existing post
    const existingPostResult = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (existingPostResult.length === 0) {
      return NextResponse.json(
        { error: "Post not found", code: "POST_NOT_FOUND" },
        { status: 404 }
      );
    }

    const existingPost = existingPostResult[0];

    // Check authorization: must be author or admin
    const isAuthor = user.id === existingPost.authorId;
    const isAdmin = user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        {
          error: "You do not have permission to update this post",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate category if provided
    const validCategories = [
      "general",
      "career",
      "events",
      "academic",
      "achievements",
      "announcements",
      "announcement",
      "achievement",
      "question",
      "discussion",
      "project",
    ];
    if (body.category && !validCategories.includes(body.category)) {
      return NextResponse.json(
        {
          error:
            "Invalid category. Must be one of: " + validCategories.join(", "),
          code: "INVALID_CATEGORY",
        },
        { status: 400 }
      );
    }

    // Validate visibility if provided
    const validVisibilities = ["public", "connections", "private"];
    if (body.visibility && !validVisibilities.includes(body.visibility)) {
      return NextResponse.json(
        {
          error:
            "Invalid visibility. Must be one of: " +
            validVisibilities.join(", "),
          code: "INVALID_VISIBILITY",
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    // Handle both imageUrl (singular) and imageUrls (array) for backwards compatibility
    const finalImageUrl =
      body.imageUrl ||
      (body.imageUrls && body.imageUrls.length > 0
        ? body.imageUrls[0]
        : undefined);

    // Regular users can update: content, imageUrl, category, branch, visibility
    if (body.content !== undefined) updateData.content = body.content;
    if (finalImageUrl !== undefined) updateData.imageUrl = finalImageUrl;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.branch !== undefined) updateData.branch = body.branch;
    if (body.visibility !== undefined) updateData.visibility = body.visibility;

    // Admin can also update status
    if (isAdmin && body.status !== undefined) {
      const validStatuses = ["pending", "approved", "rejected"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            error:
              "Invalid status. Must be one of: " + validStatuses.join(", "),
            code: "INVALID_STATUS",
          },
          { status: 400 }
        );
      }
      updateData.status = body.status;

      if (body.status === "approved") {
        updateData.approvedBy = user.id;
        updateData.approvedAt = new Date().toISOString();
      }
    }

    // Update post
    const updatedPost = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, postId))
      .returning();

    if (updatedPost.length === 0) {
      return NextResponse.json(
        { error: "Failed to update post", code: "UPDATE_FAILED" },
        { status: 500 }
      );
    }

    // Log activity
    await logActivity(user.id, user.role, "update_post", {
      postId,
      updates: Object.keys(updateData).filter((key) => key !== "updatedAt"),
    });

    // Get author details for response
    const authorResult = await db
      .select()
      .from(users)
      .where(eq(users.id, updatedPost[0].authorId))
      .limit(1);

    // Format response to match frontend expectations
    const responsePost = {
      id: updatedPost[0].id,
      userId: updatedPost[0].authorId,
      userName: authorResult[0]?.name || "Unknown",
      userRole: authorResult[0]?.role || "user",
      content: updatedPost[0].content,
      category: updatedPost[0].category,
      imageUrls: updatedPost[0].imageUrl ? [updatedPost[0].imageUrl] : [],
      likes: 0,
      commentsCount: 0,
      hasLiked: false,
      reactions: {
        like: 0,
        celebrate: 0,
        support: 0,
        insightful: 0,
      },
      userReaction: null,
      createdAt: updatedPost[0].createdAt,
    };

    return NextResponse.json({ post: responsePost }, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Extract id from URL path
    const pathname = request.nextUrl.pathname;
    const pathParts = pathname.split("/");
    const id = pathParts[3];

    // Validate id
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Valid post ID is required", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    const postId = parseInt(id);

    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    // Get existing post
    const existingPostResult = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (existingPostResult.length === 0) {
      return NextResponse.json(
        { error: "Post not found", code: "POST_NOT_FOUND" },
        { status: 404 }
      );
    }

    const existingPost = existingPostResult[0];

    // Check authorization: must be author or admin
    const isAuthor = user.id === existingPost.authorId;
    const isAdmin = user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        {
          error: "You do not have permission to delete this post",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Delete related comments
    await db.delete(comments).where(eq(comments.postId, postId));

    // Delete related reactions
    await db.delete(postReactions).where(eq(postReactions.postId, postId));

    // Delete post
    const deletedPost = await db
      .delete(posts)
      .where(eq(posts.id, postId))
      .returning();

    if (deletedPost.length === 0) {
      return NextResponse.json(
        { error: "Failed to delete post", code: "DELETE_FAILED" },
        { status: 500 }
      );
    }

    // Log activity
    await logActivity(user.id, user.role, "delete_post", { postId });

    // Log to audit log if admin deletes
    if (isAdmin) {
      await logAudit(
        user.id,
        user.role,
        "delete_post",
        "post",
        postId.toString(),
        {
          postContent: existingPost.content.substring(0, 100),
          authorId: existingPost.authorId,
        },
        request
      );
    }

    return NextResponse.json(
      {
        message: "Post deleted successfully",
        post: deletedPost[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}

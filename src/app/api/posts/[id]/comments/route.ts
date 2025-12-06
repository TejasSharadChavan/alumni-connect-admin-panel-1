import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  comments,
  posts,
  sessions,
  users,
  activityLog,
  notifications,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
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

  // Accept both 'active' and 'approved' status
  if (user[0].status !== "active" && user[0].status !== "approved") {
    return null;
  }

  return user[0];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const pathSegments = request.nextUrl.pathname.split("/");
    const postId = pathSegments[3];

    if (!postId || isNaN(parseInt(postId))) {
      return NextResponse.json(
        {
          error: "Valid post ID is required",
          code: "INVALID_POST_ID",
        },
        { status: 400 }
      );
    }

    const postIdInt = parseInt(postId);

    const requestBody = await request.json();
    const { content } = requestBody;

    if ("authorId" in requestBody || "author_id" in requestBody) {
      return NextResponse.json(
        {
          error: "User ID cannot be provided in request body",
          code: "USER_ID_NOT_ALLOWED",
        },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          error: "Content is required",
          code: "MISSING_CONTENT",
        },
        { status: 400 }
      );
    }

    if (typeof content !== "string") {
      return NextResponse.json(
        {
          error: "Content must be a string",
          code: "INVALID_CONTENT_TYPE",
        },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length < 1) {
      return NextResponse.json(
        {
          error: "Content must be at least 1 character long",
          code: "CONTENT_TOO_SHORT",
        },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 1000) {
      return NextResponse.json(
        {
          error: "Content must not exceed 1000 characters",
          code: "CONTENT_TOO_LONG",
        },
        { status: 400 }
      );
    }

    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postIdInt))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json(
        {
          error: "Post not found",
          code: "POST_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const postData = post[0];

    if (postData.visibility === "private" && postData.authorId !== user.id) {
      return NextResponse.json(
        {
          error: "You do not have access to comment on this post",
          code: "NO_ACCESS",
        },
        { status: 403 }
      );
    }

    if (
      postData.visibility === "connections" &&
      postData.authorId !== user.id
    ) {
      return NextResponse.json(
        {
          error: "You do not have access to comment on this post",
          code: "NO_ACCESS",
        },
        { status: 403 }
      );
    }

    const newComment = await db
      .insert(comments)
      .values({
        postId: postIdInt,
        authorId: user.id,
        content: trimmedContent,
        createdAt: new Date().toISOString(),
      })
      .returning();

    const createdComment = newComment[0];

    const author = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        profileImageUrl: users.profileImageUrl,
        headline: users.headline,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const commentWithAuthor = {
      ...createdComment,
      author: author[0],
    };

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: "comment_on_post",
      metadata: JSON.stringify({
        postId: postIdInt,
        commentId: createdComment.id,
      }),
      timestamp: new Date().toISOString(),
    });

    if (postData.authorId !== user.id) {
      await db.insert(notifications).values({
        userId: postData.authorId,
        type: "post",
        title: "New comment on your post",
        message: `${user.name} commented on your post`,
        relatedId: createdComment.id.toString(),
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        comment: {
          id: createdComment.id,
          postId: createdComment.postId,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          content: createdComment.content,
          likes: 0,
          hasLiked: false,
          createdAt: createdComment.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      {
        error:
          "Internal server error: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const pathSegments = request.nextUrl.pathname.split("/");
    const postId = pathSegments[3];

    if (!postId || isNaN(parseInt(postId))) {
      return NextResponse.json(
        {
          error: "Valid post ID is required",
          code: "INVALID_POST_ID",
        },
        { status: 400 }
      );
    }

    const postIdInt = parseInt(postId);

    // Get all comments for this post
    const postComments = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        content: comments.content,
        createdAt: comments.createdAt,
        authorId: comments.authorId,
        userName: users.name,
        userRole: users.role,
        userId: users.id,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, postIdInt))
      .orderBy(comments.createdAt);

    return NextResponse.json(
      {
        comments: postComments,
        count: postComments.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET comments error:", error);
    return NextResponse.json(
      {
        error:
          "Internal server error: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}

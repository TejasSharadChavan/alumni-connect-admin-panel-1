import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  posts,
  users,
  sessions,
  activityLog,
  notifications,
  postReactions,
  comments,
  connections,
} from "@/db/schema";
import { eq, like, and, or, desc, inArray, sql, count } from "drizzle-orm";

// Authentication helper
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    // Get session and check if valid
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0) {
      return null;
    }

    // Check if session is expired
    const expiresAt = new Date(session[0].expiresAt);
    if (expiresAt < new Date()) {
      return null;
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session[0].userId))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    // Accept both 'active' and 'approved' status
    if (user[0].status !== "active" && user[0].status !== "approved") {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

// Log activity helper
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
      metadata: JSON.stringify(metadata),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Activity log error:", error);
  }
}

// Create notification helper
async function createNotification(
  userId: number,
  type: string,
  title: string,
  message: string,
  relatedId?: string
) {
  try {
    await db.insert(notifications).values({
      userId,
      type,
      title,
      message,
      relatedId,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Notification creation error:", error);
  }
}

// GET /api/posts - List posts with filtering
export async function GET(request: NextRequest) {
  try {
    // Make authentication optional - allow public viewing of approved posts
    const user = await authenticateRequest(request);

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const branch = searchParams.get("branch");
    const authorId = searchParams.get("author");
    const status = searchParams.get("status");
    const visibility = searchParams.get("visibility");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    // Build WHERE conditions
    const conditions: any[] = [];

    // Status filtering based on role
    if (user?.role === "admin") {
      // Admin can see all posts, optionally filter by status
      if (status) {
        conditions.push(eq(posts.status, status));
      }
    } else {
      // Non-admin users and public viewers only see approved posts
      conditions.push(eq(posts.status, "approved"));
    }

    // Category filter
    if (category && category !== "all") {
      console.log("Filtering by category:", category);
      conditions.push(eq(posts.category, category));
    }

    // Branch filter
    if (branch) {
      conditions.push(eq(posts.branch, branch));
    }

    // Author filter
    if (authorId) {
      conditions.push(eq(posts.authorId, parseInt(authorId)));
    }

    // Visibility filter
    if (user) {
      // Authenticated users see visibility-filtered posts
      if (visibility) {
        conditions.push(eq(posts.visibility, visibility));
      } else {
        // Default visibility logic: show public posts OR own posts OR posts from connections

        // Get user's connections
        const userConnections = await db
          .select({
            connectedUserId: sql<number>`CASE 
            WHEN ${connections.requesterId} = ${user.id} THEN ${connections.responderId}
            WHEN ${connections.responderId} = ${user.id} THEN ${connections.requesterId}
          END`.as("connectedUserId"),
          })
          .from(connections)
          .where(
            and(
              or(
                eq(connections.requesterId, user.id),
                eq(connections.responderId, user.id)
              ),
              eq(connections.status, "accepted")
            )
          );

        const connectionIds = userConnections
          .map((c) => c.connectedUserId)
          .filter((id) => id !== null);

        // Visibility conditions:
        // 1. Public posts
        // 2. Own posts (any visibility)
        // 3. Posts from connections with 'connections' visibility
        const visibilityConditions = or(
          eq(posts.visibility, "public"),
          eq(posts.authorId, user.id),
          and(
            eq(posts.visibility, "connections"),
            connectionIds.length > 0
              ? inArray(posts.authorId, connectionIds)
              : sql`1=0`
          )
        );

        conditions.push(visibilityConditions);
      }
    } else {
      // Public viewers only see public posts
      conditions.push(eq(posts.visibility, "public"));
    }

    // Build query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get posts with author details
    const postsWithAuthors = await db
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
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(whereClause)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    // Get reaction counts and comment counts for each post
    const postIds = postsWithAuthors.map((p) => p.id);

    let reactionCounts: any[] = [];
    let commentCounts: any[] = [];
    let userReactions: any[] = [];

    if (postIds.length > 0) {
      // Get total reaction counts by type
      const reactionsByType = await db
        .select({
          postId: postReactions.postId,
          type: postReactions.reactionType,
          count: count(postReactions.id).as("count"),
        })
        .from(postReactions)
        .where(inArray(postReactions.postId, postIds))
        .groupBy(postReactions.postId, postReactions.reactionType);

      // Get user's reactions if authenticated
      if (user) {
        userReactions = await db
          .select({
            postId: postReactions.postId,
            type: postReactions.reactionType,
          })
          .from(postReactions)
          .where(
            and(
              inArray(postReactions.postId, postIds),
              eq(postReactions.userId, user.id)
            )
          );
      }

      commentCounts = await db
        .select({
          postId: comments.postId,
          count: count(comments.id).as("count"),
        })
        .from(comments)
        .where(inArray(comments.postId, postIds))
        .groupBy(comments.postId);

      // Build reaction maps
      const reactionMapTemp = new Map<
        number,
        { like: number; celebrate: number; support: number; insightful: number }
      >();
      for (const reaction of reactionsByType) {
        if (!reactionMapTemp.has(reaction.postId)) {
          reactionMapTemp.set(reaction.postId, {
            like: 0,
            celebrate: 0,
            support: 0,
            insightful: 0,
          });
        }
        const reactions = reactionMapTemp.get(reaction.postId)!;
        const reactionType = reaction.type as
          | "like"
          | "celebrate"
          | "support"
          | "insightful";
        reactions[reactionType] = Number(reaction.count);
      }

      // Convert to array format
      reactionCounts = Array.from(reactionMapTemp.entries()).map(
        ([postId, reactions]) => ({
          postId,
          reactions,
        })
      );
    }

    // Build maps
    const reactionMapByPost = new Map(
      reactionCounts.map((r) => [r.postId, r.reactions])
    );
    const commentMap = new Map(commentCounts.map((c) => [c.postId, c.count]));
    const userReactionMap = new Map(
      userReactions.map((r) => [r.postId, r.type])
    );

    // Ensure every post has reaction data even if no reactions exist
    const formattedPosts = postsWithAuthors.map((post) => ({
      id: post.id,
      userId: post.authorId,
      userName: post.authorName || "Unknown User",
      userRole: post.authorRole || "user",
      content: post.content,
      category: post.category,
      imageUrls: post.imageUrl ? [post.imageUrl] : [],
      likes: 0, // Deprecated, use reactions instead
      commentsCount: Number(commentMap.get(post.id) || 0),
      hasLiked: false, // Deprecated
      reactions: reactionMapByPost.get(post.id) || {
        like: 0,
        celebrate: 0,
        support: 0,
        insightful: 0,
      },
      userReaction: userReactionMap.get(post.id) || null,
      createdAt: post.createdAt,
    }));

    // Log activity only if user is authenticated
    if (user) {
      await logActivity(user.id, user.role, "view_posts", {
        filters: {
          category,
          branch,
          authorId,
          status,
          visibility,
          limit,
          offset,
        },
        resultCount: formattedPosts.length,
      });
    }

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error("GET posts error:", error);
    return NextResponse.json(
      {
        error: "Internal server error: " + (error as Error).message,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    if (user.status !== "active" && user.status !== "approved") {
      return NextResponse.json(
        {
          error: "Only active or approved users can create posts",
          code: "USER_NOT_ACTIVE",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, imageUrl, imageUrls, category, branch, visibility } = body;

    // Handle both imageUrl (singular) and imageUrls (array) for backwards compatibility
    const finalImageUrl =
      imageUrl || (imageUrls && imageUrls.length > 0 ? imageUrls[0] : null);

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Content is required and cannot be empty",
          code: "MISSING_CONTENT",
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          error: "Category is required",
          code: "MISSING_CATEGORY",
        },
        { status: 400 }
      );
    }

    // Validate category
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
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          error: `Category must be one of: ${validCategories.join(", ")}`,
          code: "INVALID_CATEGORY",
        },
        { status: 400 }
      );
    }

    // Validate visibility
    const validVisibilities = ["public", "connections", "private"];
    const postVisibility = visibility || "public";
    if (!validVisibilities.includes(postVisibility)) {
      return NextResponse.json(
        {
          error: `Visibility must be one of: ${validVisibilities.join(", ")}`,
          code: "INVALID_VISIBILITY",
        },
        { status: 400 }
      );
    }

    // Determine status based on role
    let postStatus = "pending";
    if (
      user.role === "student" ||
      user.role === "faculty" ||
      user.role === "admin"
    ) {
      postStatus = "approved";
    } else if (user.role === "alumni") {
      postStatus = "pending";
    }

    // Create post
    const newPost = await db
      .insert(posts)
      .values({
        authorId: user.id,
        content: content.trim(),
        imageUrl: finalImageUrl,
        category,
        branch: branch || null,
        visibility: postVisibility,
        status: postStatus,
        approvedBy: postStatus === "approved" ? user.id : null,
        approvedAt: postStatus === "approved" ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    if (newPost.length === 0) {
      return NextResponse.json(
        {
          error: "Failed to create post",
          code: "POST_CREATION_FAILED",
        },
        { status: 500 }
      );
    }

    // Get author details for response
    const postWithAuthor = await db
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
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, newPost[0].id))
      .limit(1);

    const formattedPost = {
      id: postWithAuthor[0].id,
      authorId: postWithAuthor[0].authorId,
      content: postWithAuthor[0].content,
      imageUrl: postWithAuthor[0].imageUrl,
      category: postWithAuthor[0].category,
      branch: postWithAuthor[0].branch,
      visibility: postWithAuthor[0].visibility,
      status: postWithAuthor[0].status,
      approvedBy: postWithAuthor[0].approvedBy,
      approvedAt: postWithAuthor[0].approvedAt,
      createdAt: postWithAuthor[0].createdAt,
      updatedAt: postWithAuthor[0].updatedAt,
      author: {
        id: postWithAuthor[0].authorId,
        name: postWithAuthor[0].authorName,
        email: postWithAuthor[0].authorEmail,
        role: postWithAuthor[0].authorRole,
        profileImageUrl: postWithAuthor[0].authorProfileImageUrl,
        headline: postWithAuthor[0].authorHeadline,
      },
      reactionCount: 0,
      commentCount: 0,
    };

    // Log activity
    await logActivity(user.id, user.role, "create_post", {
      postId: newPost[0].id,
      category,
      status: postStatus,
    });

    // If alumni post (pending), notify all admins
    if (postStatus === "pending") {
      const admins = await db
        .select()
        .from(users)
        .where(and(eq(users.role, "admin"), eq(users.status, "active")));

      for (const admin of admins) {
        await createNotification(
          admin.id,
          "post",
          "New Post Pending Approval",
          `${user.name} (${user.role}) has created a new ${category} post that requires approval.`,
          newPost[0].id.toString()
        );
      }
    }

    // Format response to match frontend expectations
    const responsePost = {
      id: formattedPost.id,
      userId: formattedPost.authorId,
      userName: formattedPost.author.name,
      userRole: formattedPost.author.role,
      content: formattedPost.content,
      category: formattedPost.category,
      imageUrls: formattedPost.imageUrl ? [formattedPost.imageUrl] : [],
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
      createdAt: formattedPost.createdAt,
    };

    return NextResponse.json({ post: responsePost }, { status: 201 });
  } catch (error) {
    console.error("POST posts error:", error);
    return NextResponse.json(
      {
        error: "Internal server error: " + (error as Error).message,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

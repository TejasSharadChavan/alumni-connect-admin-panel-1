import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts, users, sessions, activityLog, notifications, postReactions, comments, connections } from '@/db/schema';
import { eq, like, and, or, desc, inArray, sql, count } from 'drizzle-orm';

// Authentication helper
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    // Get session and check if valid
    const session = await db.select()
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
    const user = await db.select()
      .from(users)
      .where(eq(users.id, session[0].userId))
      .limit(1);

    if (user.length === 0 || user[0].status !== 'active') {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Log activity helper
async function logActivity(userId: number, role: string, action: string, metadata: any) {
  try {
    await db.insert(activityLog).values({
      userId,
      role,
      action,
      metadata: JSON.stringify(metadata),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Activity log error:', error);
  }
}

// Create notification helper
async function createNotification(userId: number, type: string, title: string, message: string, relatedId?: string) {
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
    console.error('Notification creation error:', error);
  }
}

// GET /api/posts - List posts with filtering
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const branch = searchParams.get('branch');
    const authorId = searchParams.get('author');
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Build WHERE conditions
    const conditions: any[] = [];

    // Status filtering based on role
    if (user.role === 'admin') {
      // Admin can see all posts, optionally filter by status
      if (status) {
        conditions.push(eq(posts.status, status));
      }
    } else {
      // Non-admin users only see approved posts
      conditions.push(eq(posts.status, 'approved'));
    }

    // Category filter
    if (category) {
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
    if (visibility) {
      conditions.push(eq(posts.visibility, visibility));
    } else {
      // Default visibility logic: show public posts OR own posts OR posts from connections
      
      // Get user's connections
      const userConnections = await db.select({
        connectedUserId: sql<number>`CASE 
          WHEN ${connections.requesterId} = ${user.id} THEN ${connections.responderId}
          WHEN ${connections.responderId} = ${user.id} THEN ${connections.requesterId}
        END`.as('connectedUserId')
      })
        .from(connections)
        .where(
          and(
            or(
              eq(connections.requesterId, user.id),
              eq(connections.responderId, user.id)
            ),
            eq(connections.status, 'accepted')
          )
        );

      const connectionIds = userConnections
        .map(c => c.connectedUserId)
        .filter(id => id !== null);

      // Visibility conditions:
      // 1. Public posts
      // 2. Own posts (any visibility)
      // 3. Posts from connections with 'connections' visibility
      const visibilityConditions = or(
        eq(posts.visibility, 'public'),
        eq(posts.authorId, user.id),
        and(
          eq(posts.visibility, 'connections'),
          connectionIds.length > 0 ? inArray(posts.authorId, connectionIds) : sql`1=0`
        )
      );

      conditions.push(visibilityConditions);
    }

    // Build query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get posts with author details
    const postsWithAuthors = await db.select({
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
    const postIds = postsWithAuthors.map(p => p.id);
    
    let reactionCounts: any[] = [];
    let commentCounts: any[] = [];

    if (postIds.length > 0) {
      reactionCounts = await db.select({
        postId: postReactions.postId,
        count: count(postReactions.id).as('count')
      })
        .from(postReactions)
        .where(inArray(postReactions.postId, postIds))
        .groupBy(postReactions.postId);

      commentCounts = await db.select({
        postId: comments.postId,
        count: count(comments.id).as('count')
      })
        .from(comments)
        .where(inArray(comments.postId, postIds))
        .groupBy(comments.postId);
    }

    // Build reaction and comment maps
    const reactionMap = new Map(reactionCounts.map(r => [r.postId, r.count]));
    const commentMap = new Map(commentCounts.map(c => [c.postId, c.count]));

    // Format response
    const formattedPosts = postsWithAuthors.map(post => ({
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
      reactionCount: reactionMap.get(post.id) || 0,
      commentCount: commentMap.get(post.id) || 0,
    }));

    // Log activity
    await logActivity(user.id, user.role, 'view_posts', {
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

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error('GET posts error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ 
        error: 'Only active users can create posts',
        code: 'USER_NOT_ACTIVE' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { content, imageUrl, category, branch, visibility } = body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Content is required and cannot be empty',
        code: 'MISSING_CONTENT' 
      }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ 
        error: 'Category is required',
        code: 'MISSING_CATEGORY' 
      }, { status: 400 });
    }

    // Validate category
    const validCategories = ['announcement', 'achievement', 'question', 'discussion', 'project'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ 
        error: `Category must be one of: ${validCategories.join(', ')}`,
        code: 'INVALID_CATEGORY' 
      }, { status: 400 });
    }

    // Validate visibility
    const validVisibilities = ['public', 'connections', 'private'];
    const postVisibility = visibility || 'public';
    if (!validVisibilities.includes(postVisibility)) {
      return NextResponse.json({ 
        error: `Visibility must be one of: ${validVisibilities.join(', ')}`,
        code: 'INVALID_VISIBILITY' 
      }, { status: 400 });
    }

    // Determine status based on role
    let postStatus = 'pending';
    if (user.role === 'student' || user.role === 'faculty' || user.role === 'admin') {
      postStatus = 'approved';
    } else if (user.role === 'alumni') {
      postStatus = 'pending';
    }

    // Create post
    const newPost = await db.insert(posts).values({
      authorId: user.id,
      content: content.trim(),
      imageUrl: imageUrl || null,
      category,
      branch: branch || null,
      visibility: postVisibility,
      status: postStatus,
      approvedBy: postStatus === 'approved' ? user.id : null,
      approvedAt: postStatus === 'approved' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    if (newPost.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to create post',
        code: 'POST_CREATION_FAILED' 
      }, { status: 500 });
    }

    // Get author details for response
    const postWithAuthor = await db.select({
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
    await logActivity(user.id, user.role, 'create_post', {
      postId: newPost[0].id,
      category,
      status: postStatus,
    });

    // If alumni post (pending), notify all admins
    if (postStatus === 'pending') {
      const admins = await db.select()
        .from(users)
        .where(and(
          eq(users.role, 'admin'),
          eq(users.status, 'active')
        ));

      for (const admin of admins) {
        await createNotification(
          admin.id,
          'post',
          'New Post Pending Approval',
          `${user.name} (${user.role}) has created a new ${category} post that requires approval.`,
          newPost[0].id.toString()
        );
      }
    }

    return NextResponse.json(formattedPost, { status: 201 });
  } catch (error) {
    console.error('POST posts error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}
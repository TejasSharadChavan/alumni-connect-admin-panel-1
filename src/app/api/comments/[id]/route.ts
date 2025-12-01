import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comments, sessions, users, activityLog } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    // Extract comment ID from URL path
    const id = request.nextUrl.pathname.split('/').pop();
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid comment ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const commentId = parseInt(id);

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Validate session and get authenticated user
    const sessionResult = await db.select({
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      userRole: users.role
    })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid or expired session',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const session = sessionResult[0];

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ 
        error: 'Session expired',
        code: 'SESSION_EXPIRED' 
      }, { status: 401 });
    }

    const authenticatedUserId = session.userId;
    const userRole = session.userRole;

    // Get existing comment
    const existingComment = await db.select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (existingComment.length === 0) {
      return NextResponse.json({ 
        error: 'Comment not found',
        code: 'COMMENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const comment = existingComment[0];

    // Check if user is the author OR is an admin
    const isAuthor = comment.authorId === authenticatedUserId;
    const isAdmin = userRole === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ 
        error: 'You do not have permission to delete this comment',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    // Delete the comment
    const deleted = await db.delete(comments)
      .where(eq(comments.id, commentId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete comment',
        code: 'DELETE_FAILED' 
      }, { status: 500 });
    }

    // Log activity
    await db.insert(activityLog).values({
      userId: authenticatedUserId,
      role: userRole,
      action: 'delete_comment',
      metadata: {
        commentId: commentId,
        postId: comment.postId
      },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      message: 'Comment deleted successfully',
      comment: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE comment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}
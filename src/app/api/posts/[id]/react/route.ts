import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { postReactions, posts, sessions, users, activityLog, notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  const session = await db.select()
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

  const user = await db.select()
    .from(users)
    .where(eq(users.id, sessionData.userId))
    .limit(1);

  if (user.length === 0 || user[0].status !== 'active') {
    return null;
  }

  return user[0];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const postId = request.nextUrl.pathname.split('/')[3];
    
    if (!postId || isNaN(parseInt(postId))) {
      return NextResponse.json({ 
        error: 'Valid post ID is required',
        code: 'INVALID_POST_ID' 
      }, { status: 400 });
    }

    const { reactionType } = await request.json();

    if (!reactionType) {
      return NextResponse.json({ 
        error: 'Reaction type is required',
        code: 'MISSING_REACTION_TYPE' 
      }, { status: 400 });
    }

    if (!['like', 'heart', 'celebrate'].includes(reactionType)) {
      return NextResponse.json({ 
        error: 'Invalid reaction type. Must be one of: like, heart, celebrate',
        code: 'INVALID_REACTION_TYPE' 
      }, { status: 400 });
    }

    const post = await db.select()
      .from(posts)
      .where(eq(posts.id, parseInt(postId)))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json({ 
        error: 'Post not found',
        code: 'POST_NOT_FOUND' 
      }, { status: 404 });
    }

    if (post[0].status !== 'approved') {
      return NextResponse.json({ 
        error: 'Post is not approved',
        code: 'POST_NOT_APPROVED' 
      }, { status: 400 });
    }

    const existingReaction = await db.select()
      .from(postReactions)
      .where(and(
        eq(postReactions.postId, parseInt(postId)),
        eq(postReactions.userId, user.id)
      ))
      .limit(1);

    let reaction;
    let statusCode = 201;

    if (existingReaction.length > 0) {
      if (existingReaction[0].reactionType === reactionType) {
        return NextResponse.json(existingReaction[0], { status: 200 });
      }

      const updated = await db.update(postReactions)
        .set({
          reactionType: reactionType
        })
        .where(eq(postReactions.id, existingReaction[0].id))
        .returning();

      reaction = updated[0];
      statusCode = 200;
    } else {
      const newReaction = await db.insert(postReactions)
        .values({
          postId: parseInt(postId),
          userId: user.id,
          reactionType: reactionType,
          createdAt: new Date().toISOString()
        })
        .returning();

      reaction = newReaction[0];

      if (post[0].authorId !== user.id) {
        await db.insert(notifications).values({
          userId: post[0].authorId,
          type: 'post',
          title: 'New reaction on your post',
          message: `${user.name} reacted ${reactionType} to your post`,
          relatedId: postId,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: 'react_to_post',
      metadata: { postId: parseInt(postId), reactionType: reactionType },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(reaction, { status: statusCode });

  } catch (error) {
    console.error('POST /api/posts/[id]/react error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const postId = request.nextUrl.pathname.split('/')[3];
    
    if (!postId || isNaN(parseInt(postId))) {
      return NextResponse.json({ 
        error: 'Valid post ID is required',
        code: 'INVALID_POST_ID' 
      }, { status: 400 });
    }

    const existingReaction = await db.select()
      .from(postReactions)
      .where(and(
        eq(postReactions.postId, parseInt(postId)),
        eq(postReactions.userId, user.id)
      ))
      .limit(1);

    if (existingReaction.length === 0) {
      return NextResponse.json({ 
        error: 'Reaction not found',
        code: 'REACTION_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(postReactions)
      .where(eq(postReactions.id, existingReaction[0].id))
      .returning();

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: 'unreact_to_post',
      metadata: { postId: parseInt(postId) },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      message: 'Reaction removed successfully',
      reaction: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE /api/posts/[id]/react error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
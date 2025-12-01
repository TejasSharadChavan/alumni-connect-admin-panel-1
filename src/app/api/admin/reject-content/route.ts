import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts, jobs, events, campaigns, users, sessions, activityLog, auditLog, notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const ALLOWED_CONTENT_TYPES = ['posts', 'jobs', 'events', 'campaigns'] as const;
type ContentType = typeof ALLOWED_CONTENT_TYPES[number];

const TABLE_MAP = {
  posts,
  jobs,
  events,
  campaigns,
} as const;

async function authenticateAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Missing or invalid Authorization header', status: 401 };
    }

    const token = authHeader.substring(7);
    
    const session = await db.select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0) {
      return { error: 'Invalid session token', status: 401 };
    }

    const sessionData = session[0];
    const expiresAt = new Date(sessionData.expiresAt);
    if (expiresAt < new Date()) {
      return { error: 'Session expired', status: 401 };
    }

    const user = await db.select()
      .from(users)
      .where(eq(users.id, sessionData.userId))
      .limit(1);

    if (user.length === 0) {
      return { error: 'User not found', status: 401 };
    }

    const userData = user[0];
    if (userData.role !== 'admin') {
      return { error: 'Access denied. Admin role required', status: 403 };
    }

    return { user: userData, session: sessionData };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed', status: 500 };
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user, session } = authResult;
    const body = await request.json();
    const { type, id, reason } = body;

    if (!type || !ALLOWED_CONTENT_TYPES.includes(type)) {
      return NextResponse.json({ 
        error: `Invalid content type. Must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}`,
        code: 'INVALID_CONTENT_TYPE'
      }, { status: 400 });
    }

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid content ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      return NextResponse.json({ 
        error: 'Rejection reason must be at least 10 characters long',
        code: 'INVALID_REASON'
      }, { status: 400 });
    }

    const contentId = parseInt(id);
    const contentType = type as ContentType;
    const table = TABLE_MAP[contentType];

    const content = await db.select()
      .from(table)
      .where(eq(table.id, contentId))
      .limit(1);

    if (content.length === 0) {
      return NextResponse.json({ 
        error: `${contentType.slice(0, -1).charAt(0).toUpperCase() + contentType.slice(1, -1)} not found`,
        code: 'CONTENT_NOT_FOUND'
      }, { status: 404 });
    }

    const contentData = content[0];

    if (contentData.status !== 'pending') {
      return NextResponse.json({ 
        error: `Content has already been processed. Current status: ${contentData.status}`,
        code: 'CONTENT_ALREADY_PROCESSED'
      }, { status: 400 });
    }

    const rejected = await db.update(table)
      .set({
        status: 'rejected',
        updatedAt: new Date().toISOString()
      })
      .where(eq(table.id, contentId))
      .returning();

    if (rejected.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to reject content',
        code: 'UPDATE_FAILED'
      }, { status: 500 });
    }

    const creatorIdField = contentType === 'posts' ? 'authorId' : 
                          contentType === 'jobs' ? 'postedById' :
                          contentType === 'events' ? 'organizerId' : 'creatorId';
    
    const creatorId = contentData[creatorIdField];

    await db.insert(notifications).values({
      userId: creatorId,
      type: contentType.slice(0, -1),
      title: `Your ${contentType.slice(0, -1)} was rejected`,
      message: `Your ${contentType.slice(0, -1)} "${contentData.title || 'content'}" has been rejected. Reason: ${reason.trim()}`,
      relatedId: contentId.toString(),
      isRead: false,
      createdAt: new Date().toISOString()
    });

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: 'reject_content',
      metadata: JSON.stringify({
        contentType,
        contentId,
        reason: reason.trim()
      }),
      timestamp: new Date().toISOString()
    });

    await db.insert(auditLog).values({
      actorId: user.id,
      actorRole: user.role,
      action: 'reject_content',
      entityType: contentType,
      entityId: contentId.toString(),
      details: JSON.stringify({
        reason: reason.trim(),
        previousStatus: 'pending',
        newStatus: 'rejected'
      }),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      message: 'Content rejected successfully',
      content: rejected[0]
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
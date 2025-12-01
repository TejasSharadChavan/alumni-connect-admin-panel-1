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
  campaigns
} as const;

async function getAuthenticatedAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 };
  }

  const token = authHeader.substring(7);

  try {
    const sessionRecord = await db.select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionRecord.length === 0) {
      return { error: 'Invalid session token', status: 401 };
    }

    const session = sessionRecord[0];

    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) {
      return { error: 'Session expired', status: 401 };
    }

    const userRecord = await db.select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userRecord.length === 0) {
      return { error: 'User not found', status: 401 };
    }

    const user = userRecord[0];

    if (user.role !== 'admin') {
      return { error: 'Access denied. Admin role required.', status: 403 };
    }

    return { user, session };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed', status: 500 };
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedAdmin(request);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, session } = authResult;

    const body = await request.json();
    const { type, id } = body;

    if (!type || !ALLOWED_CONTENT_TYPES.includes(type)) {
      return NextResponse.json(
        { 
          error: 'Invalid content type. Must be one of: posts, jobs, events, campaigns',
          code: 'INVALID_CONTENT_TYPE'
        },
        { status: 400 }
      );
    }

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid content ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const contentId = parseInt(id);
    const table = TABLE_MAP[type as ContentType];

    const contentRecord = await db.select()
      .from(table)
      .where(eq(table.id, contentId))
      .limit(1);

    if (contentRecord.length === 0) {
      return NextResponse.json(
        { 
          error: `${type.slice(0, -1)} not found`,
          code: 'CONTENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const content = contentRecord[0];

    if (content.status !== 'pending') {
      return NextResponse.json(
        { 
          error: `Content has already been ${content.status}`,
          code: 'CONTENT_ALREADY_PROCESSED'
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const updatedContent = await db.update(table)
      .set({
        status: 'approved',
        approvedBy: user.id,
        approvedAt: now,
        updatedAt: now
      })
      .where(eq(table.id, contentId))
      .returning();

    if (updatedContent.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to approve content',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    const creatorIdField = type === 'posts' ? 'authorId' : 
                           type === 'campaigns' ? 'creatorId' : 
                           type === 'events' ? 'organizerId' : 'postedById';
    const creatorId = content[creatorIdField];

    const notificationTitle = type === 'posts' ? 'Post Approved' :
                             type === 'jobs' ? 'Job Posting Approved' :
                             type === 'events' ? 'Event Approved' :
                             'Campaign Approved';

    const notificationMessage = type === 'posts' ? 'Your post has been approved and is now visible to others.' :
                                type === 'jobs' ? 'Your job posting has been approved and is now live.' :
                                type === 'events' ? 'Your event has been approved and is now visible to attendees.' :
                                'Your campaign has been approved and is now accepting donations.';

    await db.insert(notifications).values({
      userId: creatorId,
      type: type.slice(0, -1),
      title: notificationTitle,
      message: notificationMessage,
      relatedId: contentId.toString(),
      isRead: false,
      createdAt: now
    });

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: 'approve_content',
      metadata: JSON.stringify({
        contentType: type,
        contentId: contentId,
        contentTitle: content.title || content.content?.substring(0, 50) || 'Untitled',
        creatorId: creatorId
      }),
      timestamp: now
    });

    await db.insert(auditLog).values({
      actorId: user.id,
      actorRole: user.role,
      action: 'approve_content',
      entityType: type,
      entityId: contentId.toString(),
      details: JSON.stringify({
        contentTitle: content.title || content.content?.substring(0, 50) || 'Untitled',
        creatorId: creatorId,
        previousStatus: 'pending',
        newStatus: 'approved'
      }),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      timestamp: now
    });

    return NextResponse.json({
      success: true,
      message: `${type.slice(0, -1)} approved successfully`,
      content: updatedContent[0]
    }, { status: 200 });

  } catch (error) {
    console.error('POST /api/admin/approve-content error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}
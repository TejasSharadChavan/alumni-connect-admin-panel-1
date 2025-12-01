import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications, users, sessions, activityLog } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const session = await db.select({
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
    })
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

    const user = await db.select({
      id: users.id,
      role: users.role,
      email: users.email,
      name: users.name,
    })
      .from(users)
      .where(eq(users.id, sessionData.userId))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

async function logActivity(userId: number, role: string, action: string, metadata?: any) {
  try {
    await db.insert(activityLog).values({
      userId,
      role,
      action,
      metadata: metadata ? JSON.stringify(metadata) : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let query = db.select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    if (unreadOnly) {
      query = db.select()
        .from(notifications)
        .where(and(
          eq(notifications.userId, user.id),
          eq(notifications.isRead, false)
        ))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const results = await query;

    await logActivity(user.id, user.role, 'view_notifications', {
      limit,
      offset,
      unreadOnly,
      count: results.length,
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET notifications error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'read-all') {
      const updated = await db.update(notifications)
        .set({
          isRead: true,
        })
        .where(and(
          eq(notifications.userId, user.id),
          eq(notifications.isRead, false)
        ))
        .returning();

      await logActivity(user.id, user.role, 'mark_all_notifications_read', {
        count: updated.length,
      });

      return NextResponse.json({ 
        message: 'All notifications marked as read',
        count: updated.length,
      }, { status: 200 });
    }

    const notificationId = searchParams.get('id');

    if (!notificationId || isNaN(parseInt(notificationId))) {
      return NextResponse.json({ 
        error: 'Valid notification ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const id = parseInt(notificationId);

    const existing = await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.id, id),
        eq(notifications.userId, user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Notification not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const { isRead } = body;

    const updated = await db.update(notifications)
      .set({
        isRead: isRead !== undefined ? isRead : existing[0].isRead,
      })
      .where(and(
        eq(notifications.id, id),
        eq(notifications.userId, user.id)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update notification',
        code: 'UPDATE_FAILED' 
      }, { status: 404 });
    }

    await logActivity(user.id, user.role, 'update_notification', {
      notificationId: id,
      isRead,
    });

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT notifications error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId || isNaN(parseInt(notificationId))) {
      return NextResponse.json({ 
        error: 'Valid notification ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const id = parseInt(notificationId);

    const existing = await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.id, id),
        eq(notifications.userId, user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Notification not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(notifications)
      .where(and(
        eq(notifications.id, id),
        eq(notifications.userId, user.id)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete notification',
        code: 'DELETE_FAILED' 
      }, { status: 404 });
    }

    await logActivity(user.id, user.role, 'delete_notification', {
      notificationId: id,
      notificationType: deleted[0].type,
    });

    return NextResponse.json({ 
      message: 'Notification deleted successfully',
      notification: deleted[0],
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE notification error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
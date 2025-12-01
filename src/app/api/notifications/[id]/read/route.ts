import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications, sessions, users, activityLog } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    // Extract and validate authorization token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Validate session and get authenticated user
    const sessionResults = await db
      .select({
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
        userName: users.name,
        userRole: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionResults.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired session', code: 'INVALID_SESSION' },
        { status: 401 }
      );
    }

    const session = sessionResults[0];

    // Check if session is expired
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Session expired', code: 'SESSION_EXPIRED' },
        { status: 401 }
      );
    }

    const user = {
      id: session.userId,
      name: session.userName,
      role: session.userRole,
    };

    // Extract notification ID from URL path
    const pathParts = request.nextUrl.pathname.split('/');
    const notificationId = pathParts[3];

    // Validate notification ID
    if (!notificationId || isNaN(parseInt(notificationId))) {
      return NextResponse.json(
        { error: 'Valid notification ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const id = parseInt(notificationId);

    // Get notification by ID and verify ownership
    const existingNotification = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (existingNotification.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const notification = existingNotification[0];

    // Verify notification belongs to authenticated user
    if (notification.userId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this notification', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Update notification to mark as read
    const updatedNotification = await db
      .update(notifications)
      .set({
        isRead: true,
      })
      .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)))
      .returning();

    if (updatedNotification.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update notification', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Log activity
    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: 'mark_notification_read',
      metadata: JSON.stringify({ notificationId: id }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(updatedNotification[0], { status: 200 });
  } catch (error) {
    console.error('PUT /api/notifications/[id]/read error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
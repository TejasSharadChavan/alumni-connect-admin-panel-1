import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, users, pendingUsers, auditLog } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Find session
    const sessionResult = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const session = sessionResult[0];

    // Check if session is expired
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get admin user from session
    const adminUserResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (adminUserResult.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const adminUser = adminUserResult[0];

    // Check if user is admin
    if (adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Extract pending user ID from URL
    const id = request.nextUrl.pathname.split('/')[4];
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Get rejection reason from request body
    const body = await request.json();
    const { reason } = body;

    // Validate rejection reason
    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'Rejection reason required (min 10 characters)', code: 'INVALID_REASON' },
        { status: 400 }
      );
    }

    const trimmedReason = reason.trim();

    // Find pending user by id
    const pendingUserResult = await db
      .select()
      .from(pendingUsers)
      .where(eq(pendingUsers.id, parseInt(id)))
      .limit(1);

    if (pendingUserResult.length === 0) {
      return NextResponse.json(
        { error: 'Pending user not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const pendingUser = pendingUserResult[0];

    // Check if pending user status is 'pending'
    if (pendingUser.status !== 'pending') {
      return NextResponse.json(
        { error: 'Pending user already processed', code: 'ALREADY_PROCESSED' },
        { status: 400 }
      );
    }

    // Update pending user record
    const updatedPendingUser = await db
      .update(pendingUsers)
      .set({
        status: 'rejected',
        rejectionReason: trimmedReason,
        reviewedBy: adminUser.id,
        reviewedAt: new Date().toISOString(),
      })
      .where(eq(pendingUsers.id, parseInt(id)))
      .returning();

    // Get IP address from request headers
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Get user agent from request headers
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create audit log entry
    await db.insert(auditLog).values({
      actorId: adminUser.id,
      actorRole: adminUser.role,
      action: 'reject_user',
      entityType: 'pending_user',
      entityId: pendingUser.id.toString(),
      details: JSON.stringify({
        pendingUserEmail: pendingUser.email,
        requestedRole: pendingUser.requestedRole,
        rejectionReason: trimmedReason,
        timestamp: new Date().toISOString(),
      }),
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        message: 'User rejected successfully',
        pendingUserId: parseInt(id),
        reason: trimmedReason,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
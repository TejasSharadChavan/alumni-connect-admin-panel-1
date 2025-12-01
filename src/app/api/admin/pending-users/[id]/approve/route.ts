import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, users, pendingUsers, auditLog } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Extract ID from URL path
    const id = request.nextUrl.pathname.split('/')[4];
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid pending user ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Extract and validate authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Find session and validate
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

    // Get admin user
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

    // Find pending user
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

    // Check if already processed
    if (pendingUser.status !== 'pending') {
      return NextResponse.json(
        { error: 'Pending user already processed', code: 'ALREADY_PROCESSED' },
        { status: 400 }
      );
    }

    // Parse submitted data
    const submittedData = pendingUser.submittedData as Record<string, any> || {};

    // Create new user from pending user data
    const currentTimestamp = new Date().toISOString();
    const newUserData = {
      name: pendingUser.name,
      email: pendingUser.email,
      passwordHash: pendingUser.passwordHash,
      role: pendingUser.requestedRole,
      status: 'active',
      branch: submittedData.branch || null,
      cohort: submittedData.cohort || null,
      yearOfPassing: submittedData.yearOfPassing || null,
      department: submittedData.department || null,
      phone: submittedData.phone || null,
      headline: submittedData.headline || null,
      bio: submittedData.bio || null,
      skills: submittedData.skills || null,
      profileImageUrl: submittedData.profileImageUrl || null,
      resumeUrl: submittedData.resumeUrl || null,
      linkedinUrl: submittedData.linkedinUrl || null,
      githubUrl: submittedData.githubUrl || null,
      approvedBy: adminUser.id,
      approvedAt: currentTimestamp,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    };

    const newUserResult = await db
      .insert(users)
      .values(newUserData)
      .returning();

    const newUser = newUserResult[0];

    // Update pending user status
    await db
      .update(pendingUsers)
      .set({
        status: 'approved',
        reviewedBy: adminUser.id,
        reviewedAt: currentTimestamp,
      })
      .where(eq(pendingUsers.id, parseInt(id)));

    // Get request metadata for audit log
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create audit log entry
    await db.insert(auditLog).values({
      actorId: adminUser.id,
      actorRole: adminUser.role,
      action: 'approve_user',
      entityType: 'pending_user',
      entityId: pendingUser.id.toString(),
      details: {
        pendingUserEmail: pendingUser.email,
        approvedRole: pendingUser.requestedRole,
        timestamp: currentTimestamp,
      },
      ipAddress: ipAddress,
      userAgent: userAgent,
      timestamp: currentTimestamp,
    });

    return NextResponse.json(
      {
        message: 'User approved successfully',
        userId: newUser.id,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/pending-users/[id]/approve error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
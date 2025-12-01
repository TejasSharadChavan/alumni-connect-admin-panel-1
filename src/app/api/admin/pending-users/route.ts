import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, users, pendingUsers } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract and validate authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Find and validate session
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
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < now) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get user from session
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const user = userResult[0];

    // Verify user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate limit and offset
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter', code: 'INVALID_LIMIT' },
        { status: 400 }
      );
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { error: 'Invalid offset parameter', code: 'INVALID_OFFSET' },
        { status: 400 }
      );
    }

    // Validate status filter if provided
    if (statusFilter && !['pending', 'approved', 'rejected'].includes(statusFilter)) {
      return NextResponse.json(
        { error: 'Invalid status filter. Must be: pending, approved, or rejected', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Build query with optional status filter
    let query = db
      .select({
        id: pendingUsers.id,
        name: pendingUsers.name,
        email: pendingUsers.email,
        requestedRole: pendingUsers.requestedRole,
        submittedData: pendingUsers.submittedData,
        status: pendingUsers.status,
        rejectionReason: pendingUsers.rejectionReason,
        submittedAt: pendingUsers.submittedAt,
        reviewedBy: pendingUsers.reviewedBy,
        reviewedAt: pendingUsers.reviewedAt,
      })
      .from(pendingUsers);

    // Apply status filter if provided
    if (statusFilter) {
      query = query.where(eq(pendingUsers.status, statusFilter));
    }

    // Apply ordering and pagination
    const results = await query
      .orderBy(desc(pendingUsers.submittedAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    let countQuery = db
      .select({ count: pendingUsers.id })
      .from(pendingUsers);

    if (statusFilter) {
      countQuery = countQuery.where(eq(pendingUsers.status, statusFilter));
    }

    const countResult = await countQuery;
    const total = countResult.length;

    return NextResponse.json(
      {
        pendingUsers: results,
        total: total,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/admin/pending-users error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
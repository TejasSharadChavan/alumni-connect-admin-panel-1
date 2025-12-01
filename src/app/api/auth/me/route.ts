import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { 
          error: 'Unauthorized. No token provided.',
          code: 'NO_TOKEN'
        },
        { status: 401 }
      );
    }

    // Find session by token
    const sessionResult = await db.select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired session',
          code: 'INVALID_SESSION'
        },
        { status: 401 }
      );
    }

    const session = sessionResult[0];

    // Check if session is expired
    const isExpired = new Date(session.expiresAt) <= new Date();
    if (isExpired) {
      // Delete expired session
      await db.delete(sessions)
        .where(eq(sessions.id, session.id));

      return NextResponse.json(
        { 
          error: 'Invalid or expired session',
          code: 'INVALID_SESSION'
        },
        { status: 401 }
      );
    }

    // Get user by userId
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // Return user data excluding passwordHash
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        user: userWithoutPassword 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
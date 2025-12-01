import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Check if token is provided
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Unauthorized. No token provided.', 
          code: 'NO_TOKEN' 
        },
        { status: 401 }
      );
    }

    // Delete session from database
    const deleted = await db
      .delete(sessions)
      .where(eq(sessions.token, token))
      .returning();

    // Check if session was found and deleted
    if (deleted.length === 0) {
      return NextResponse.json(
        { 
          error: 'Session not found', 
          code: 'SESSION_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('POST logout error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message,
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
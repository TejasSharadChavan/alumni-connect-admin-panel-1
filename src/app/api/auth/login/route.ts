import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, sessions, activityLog } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          error: 'Email and password are required',
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    // Find user by email
    const userResults = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (userResults.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    const user = userResults[0];

    // Check user status before password verification
    if (user.status !== 'active') {
      return NextResponse.json(
        { 
          error: `Account not active. Status: ${user.status}`,
          code: 'ACCOUNT_INACTIVE'
        },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();

    // Extract IP address and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create session in database
    const newSession = await db.insert(sessions)
      .values({
        userId: user.id,
        token,
        expiresAt,
        createdAt,
        ipAddress,
        userAgent
      })
      .returning();

    // Log login activity
    await db.insert(activityLog)
      .values({
        userId: user.id,
        role: user.role,
        action: 'login',
        metadata: JSON.stringify({
          loginTime: createdAt,
          ipAddress
        }),
        timestamp: createdAt
      });

    // Return success response with token and user info
    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
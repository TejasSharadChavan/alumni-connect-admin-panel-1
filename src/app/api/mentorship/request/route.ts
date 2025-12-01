import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mentorshipRequests, users, sessions, activityLog, notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function validateSession(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
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

    const expiresAt = new Date(session[0].expiresAt);
    if (expiresAt < new Date()) {
      return null;
    }

    const user = await db.select()
      .from(users)
      .where(eq(users.id, session[0].userId))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await validateSession(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can request mentorship', code: 'FORBIDDEN_ROLE' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { mentorId, topic, message, preferredTime } = body;

    if (!mentorId || !topic || !message) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: mentorId, topic, and message are required',
          code: 'MISSING_REQUIRED_FIELDS' 
        },
        { status: 400 }
      );
    }

    if (typeof mentorId !== 'number' || mentorId <= 0) {
      return NextResponse.json(
        { error: 'Invalid mentorId format', code: 'INVALID_MENTOR_ID' },
        { status: 400 }
      );
    }

    const mentor = await db.select()
      .from(users)
      .where(eq(users.id, mentorId))
      .limit(1);

    if (mentor.length === 0) {
      return NextResponse.json(
        { error: 'Mentor not found', code: 'MENTOR_NOT_FOUND' },
        { status: 400 }
      );
    }

    if (mentor[0].role !== 'alumni' && mentor[0].role !== 'faculty') {
      return NextResponse.json(
        { 
          error: 'Selected user is not available as a mentor. Only alumni and faculty can be mentors.',
          code: 'INVALID_MENTOR_ROLE' 
        },
        { status: 400 }
      );
    }

    const existingPendingRequest = await db.select()
      .from(mentorshipRequests)
      .where(
        and(
          eq(mentorshipRequests.studentId, user.id),
          eq(mentorshipRequests.mentorId, mentorId),
          eq(mentorshipRequests.status, 'pending')
        )
      )
      .limit(1);

    if (existingPendingRequest.length > 0) {
      return NextResponse.json(
        { 
          error: 'You already have a pending mentorship request with this mentor',
          code: 'DUPLICATE_PENDING_REQUEST' 
        },
        { status: 400 }
      );
    }

    const currentTimestamp = new Date().toISOString();

    const newRequest = await db.insert(mentorshipRequests)
      .values({
        studentId: user.id,
        mentorId: mentorId,
        topic: topic.trim(),
        message: message.trim(),
        preferredTime: preferredTime ? preferredTime.trim() : null,
        status: 'pending',
        createdAt: currentTimestamp,
        respondedAt: null,
      })
      .returning();

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: 'request_mentorship',
      metadata: JSON.stringify({
        mentorId: mentorId,
        requestId: newRequest[0].id,
      }),
      timestamp: currentTimestamp,
    });

    await db.insert(notifications).values({
      userId: mentorId,
      type: 'mentorship',
      title: 'New Mentorship Request',
      message: `${user.name} has requested mentorship on: ${topic}`,
      relatedId: newRequest[0].id.toString(),
      isRead: false,
      createdAt: currentTimestamp,
    });

    return NextResponse.json(newRequest[0], { status: 201 });
  } catch (error) {
    console.error('POST mentorship request error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rsvps, events, users, sessions, activityLog } from '@/db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract and validate authentication token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Validate session
    const sessionResult = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired session', code: 'INVALID_SESSION' },
        { status: 401 }
      );
    }

    const session = sessionResult[0];

    // Check if session is expired
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Session expired', code: 'SESSION_EXPIRED' },
        { status: 401 }
      );
    }

    // Get authenticated user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 401 }
      );
    }

    const authenticatedUser = userResult[0];

    // Extract event ID from URL path
    const pathSegments = request.nextUrl.pathname.split('/');
    const eventId = pathSegments[3];

    // Validate event ID
    if (!eventId || isNaN(parseInt(eventId))) {
      return NextResponse.json(
        { error: 'Valid event ID is required', code: 'INVALID_EVENT_ID' },
        { status: 400 }
      );
    }

    const eventIdInt = parseInt(eventId);

    // Validate event exists
    const eventResult = await db
      .select()
      .from(events)
      .where(eq(events.id, eventIdInt))
      .limit(1);

    if (eventResult.length === 0) {
      return NextResponse.json(
        { error: 'Event not found', code: 'EVENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get all RSVPs for this event where status is 'registered' or 'attended'
    const eventRsvps = await db
      .select({
        id: rsvps.id,
        eventId: rsvps.eventId,
        userId: rsvps.userId,
        status: rsvps.status,
        paymentStatus: rsvps.paymentStatus,
        rsvpedAt: rsvps.rsvpedAt,
      })
      .from(rsvps)
      .where(
        and(
          eq(rsvps.eventId, eventIdInt),
          or(
            eq(rsvps.status, 'registered'),
            eq(rsvps.status, 'attended')
          )
        )
      )
      .orderBy(rsvps.rsvpedAt);

    // If no RSVPs found, return empty array
    if (eventRsvps.length === 0) {
      // Log activity
      await db.insert(activityLog).values({
        userId: authenticatedUser.id,
        role: authenticatedUser.role,
        action: 'view_event_attendees',
        metadata: { eventId: eventIdInt },
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json([], { status: 200 });
    }

    // Get user IDs from RSVPs
    const userIds = eventRsvps.map(rsvp => rsvp.userId);

    // Fetch attendee details
    const attendees = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        branch: users.branch,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .where(inArray(users.id, userIds));

    // Create a map of user details for quick lookup
    const attendeeMap = new Map(
      attendees.map(attendee => [attendee.id, attendee])
    );

    // Combine RSVP data with attendee details
    const attendeesWithDetails = eventRsvps.map(rsvp => {
      const attendeeDetails = attendeeMap.get(rsvp.userId);
      return {
        rsvpId: rsvp.id,
        eventId: rsvp.eventId,
        status: rsvp.status,
        paymentStatus: rsvp.paymentStatus,
        rsvpedAt: rsvp.rsvpedAt,
        attendee: attendeeDetails ? {
          id: attendeeDetails.id,
          name: attendeeDetails.name,
          email: attendeeDetails.email,
          role: attendeeDetails.role,
          branch: attendeeDetails.branch,
          profileImageUrl: attendeeDetails.profileImageUrl,
        } : null,
      };
    });

    // Log activity
    await db.insert(activityLog).values({
      userId: authenticatedUser.id,
      role: authenticatedUser.role,
      action: 'view_event_attendees',
      metadata: { eventId: eventIdInt },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(attendeesWithDetails, { status: 200 });

  } catch (error) {
    console.error('GET /api/events/[id]/attendees error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
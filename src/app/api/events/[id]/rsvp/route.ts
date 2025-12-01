import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rsvps, events, users, sessions, activityLog, notifications } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  const session = await db.select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (session.length === 0) {
    return null;
  }

  const sessionExpiry = new Date(session[0].expiresAt);
  if (sessionExpiry < new Date()) {
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
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const eventIdStr = request.nextUrl.pathname.split('/')[3];
    const eventId = parseInt(eventIdStr);

    if (!eventId || isNaN(eventId)) {
      return NextResponse.json({ 
        error: 'Valid event ID is required',
        code: 'INVALID_EVENT_ID' 
      }, { status: 400 });
    }

    const event = await db.select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return NextResponse.json({ 
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const eventData = event[0];

    if (eventData.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Event is not approved',
        code: 'EVENT_NOT_APPROVED' 
      }, { status: 400 });
    }

    const eventStartDate = new Date(eventData.startDate);
    const now = new Date();

    if (eventStartDate <= now) {
      return NextResponse.json({ 
        error: 'Event has already started',
        code: 'EVENT_ALREADY_STARTED' 
      }, { status: 400 });
    }

    if (eventData.maxAttendees) {
      const attendeeCount = await db.select({ count: count() })
        .from(rsvps)
        .where(
          and(
            eq(rsvps.eventId, eventId),
            eq(rsvps.status, 'registered')
          )
        );

      const currentAttendees = attendeeCount[0]?.count || 0;

      if (currentAttendees >= eventData.maxAttendees) {
        return NextResponse.json({ 
          error: 'Event is full',
          code: 'EVENT_FULL' 
        }, { status: 400 });
      }
    }

    const existingRsvp = await db.select()
      .from(rsvps)
      .where(
        and(
          eq(rsvps.eventId, eventId),
          eq(rsvps.userId, user.id)
        )
      )
      .limit(1);

    if (existingRsvp.length > 0 && existingRsvp[0].status !== 'cancelled') {
      return NextResponse.json({ 
        error: 'You have already RSVPed to this event',
        code: 'ALREADY_RSVPED' 
      }, { status: 400 });
    }

    const paymentStatus = eventData.isPaid ? 'pending' : 'na';
    const rsvpedAt = new Date().toISOString();

    const newRsvp = await db.insert(rsvps)
      .values({
        eventId,
        userId: user.id,
        status: 'registered',
        paymentStatus,
        rsvpedAt
      })
      .returning();

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: 'rsvp_to_event',
      metadata: JSON.stringify({
        eventId,
        rsvpId: newRsvp[0].id
      }),
      timestamp: new Date().toISOString()
    });

    await db.insert(notifications).values({
      userId: eventData.organizerId,
      type: 'event',
      title: 'New RSVP',
      message: `${user.name} has RSVPed to your event "${eventData.title}"`,
      relatedId: newRsvp[0].id.toString(),
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(newRsvp[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const eventIdStr = request.nextUrl.pathname.split('/')[3];
    const eventId = parseInt(eventIdStr);

    if (!eventId || isNaN(eventId)) {
      return NextResponse.json({ 
        error: 'Valid event ID is required',
        code: 'INVALID_EVENT_ID' 
      }, { status: 400 });
    }

    const existingRsvp = await db.select()
      .from(rsvps)
      .where(
        and(
          eq(rsvps.eventId, eventId),
          eq(rsvps.userId, user.id)
        )
      )
      .limit(1);

    if (existingRsvp.length === 0) {
      return NextResponse.json({ 
        error: 'RSVP not found',
        code: 'RSVP_NOT_FOUND' 
      }, { status: 404 });
    }

    await db.update(rsvps)
      .set({
        status: 'cancelled'
      })
      .where(eq(rsvps.id, existingRsvp[0].id));

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: 'cancel_rsvp',
      metadata: JSON.stringify({
        eventId
      }),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      message: 'RSVP cancelled successfully',
      rsvpId: existingRsvp[0].id
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
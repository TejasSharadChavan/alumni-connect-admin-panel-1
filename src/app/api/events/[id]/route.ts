import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, rsvps, users, sessions, activityLog, notifications } from '@/db/schema';
import { eq, and, count, desc } from 'drizzle-orm';

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

  const sessionData = session[0];
  const expiresAt = new Date(sessionData.expiresAt);
  if (expiresAt < new Date()) {
    return null;
  }

  const user = await db.select()
    .from(users)
    .where(eq(users.id, sessionData.userId))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

async function logActivity(userId: number, role: string, action: string, metadata: any) {
  try {
    await db.insert(activityLog).values({
      userId,
      role,
      action,
      metadata: metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

async function notifyRsvpedUsers(eventId: number, eventTitle: string) {
  try {
    const attendees = await db.select({
      userId: rsvps.userId,
    })
    .from(rsvps)
    .where(and(
      eq(rsvps.eventId, eventId),
      eq(rsvps.status, 'registered')
    ));

    const notificationPromises = attendees.map(attendee => 
      db.insert(notifications).values({
        userId: attendee.userId,
        type: 'event',
        title: 'Event Cancelled',
        message: `The event "${eventTitle}" has been cancelled.`,
        relatedId: eventId.toString(),
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Failed to notify RSVPed users:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split('/')[3];
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid event ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const eventId = parseInt(id);

    const eventResult = await db.select({
      event: events,
      organizer: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        branch: users.branch,
        profileImageUrl: users.profileImageUrl,
        headline: users.headline,
      }
    })
    .from(events)
    .leftJoin(users, eq(events.organizerId, users.id))
    .where(eq(events.id, eventId))
    .limit(1);

    if (eventResult.length === 0) {
      return NextResponse.json({ 
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const { event, organizer } = eventResult[0];

    const isAdmin = user.role === 'admin';
    if (!isAdmin && event.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const rsvpCountResult = await db.select({
      count: count()
    })
    .from(rsvps)
    .where(and(
      eq(rsvps.eventId, eventId),
      eq(rsvps.status, 'registered')
    ));

    const rsvpCount = rsvpCountResult[0]?.count || 0;

    const attendeesList = await db.select({
      id: rsvps.id,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      userRole: users.role,
      userBranch: users.branch,
      userProfileImageUrl: users.profileImageUrl,
      status: rsvps.status,
      paymentStatus: rsvps.paymentStatus,
      rsvpedAt: rsvps.rsvpedAt,
    })
    .from(rsvps)
    .leftJoin(users, eq(rsvps.userId, users.id))
    .where(eq(rsvps.eventId, eventId))
    .orderBy(desc(rsvps.rsvpedAt));

    await logActivity(user.id, user.role, 'view_event', { eventId });

    return NextResponse.json({
      ...event,
      organizer,
      rsvpCount,
      attendees: attendeesList,
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split('/')[3];
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid event ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const eventId = parseInt(id);

    const existingEvent = await db.select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json({ 
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const event = existingEvent[0];
    const isAdmin = user.role === 'admin';
    const isOrganizer = event.organizerId === user.id;

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json({ 
        error: 'You do not have permission to update this event',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const body = await request.json();

    const validCategories = ['workshop', 'webinar', 'meetup', 'conference', 'social'];
    if (body.category && !validCategories.includes(body.category)) {
      return NextResponse.json({ 
        error: 'Invalid category. Must be one of: workshop, webinar, meetup, conference, social',
        code: 'INVALID_CATEGORY' 
      }, { status: 400 });
    }

    if (body.startDate && body.endDate) {
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);
      if (endDate < startDate) {
        return NextResponse.json({ 
          error: 'End date must be after start date',
          code: 'INVALID_DATES' 
        }, { status: 400 });
      }
    }

    if (body.startDate && !body.endDate) {
      const startDate = new Date(body.startDate);
      const currentEndDate = new Date(event.endDate);
      if (currentEndDate < startDate) {
        return NextResponse.json({ 
          error: 'Start date must be before current end date',
          code: 'INVALID_DATES' 
        }, { status: 400 });
      }
    }

    if (body.endDate && !body.startDate) {
      const currentStartDate = new Date(event.startDate);
      const endDate = new Date(body.endDate);
      if (endDate < currentStartDate) {
        return NextResponse.json({ 
          error: 'End date must be after current start date',
          code: 'INVALID_DATES' 
        }, { status: 400 });
      }
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    const allowedFields = [
      'title', 'description', 'location', 'startDate', 'endDate', 
      'category', 'maxAttendees', 'isPaid', 'price', 'imageUrl', 'branch'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    if (isAdmin && body.status !== undefined) {
      const validStatuses = ['pending', 'approved', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ 
          error: 'Invalid status. Must be one of: pending, approved, cancelled',
          code: 'INVALID_STATUS' 
        }, { status: 400 });
      }
      updateData.status = body.status;
    }

    const updated = await db.update(events)
      .set(updateData)
      .where(eq(events.id, eventId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update event',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    await logActivity(user.id, user.role, 'update_event', { eventId });

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split('/')[3];
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid event ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const eventId = parseInt(id);

    const existingEvent = await db.select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json({ 
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const event = existingEvent[0];
    const isAdmin = user.role === 'admin';
    const isOrganizer = event.organizerId === user.id;

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json({ 
        error: 'You do not have permission to cancel this event',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const cancelled = await db.update(events)
      .set({
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(events.id, eventId))
      .returning();

    if (cancelled.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to cancel event',
        code: 'CANCEL_FAILED' 
      }, { status: 500 });
    }

    await notifyRsvpedUsers(eventId, event.title);

    await logActivity(user.id, user.role, 'cancel_event', { eventId });

    return NextResponse.json({
      message: 'Event cancelled successfully',
      event: cancelled[0],
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
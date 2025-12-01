import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, users, rsvps, sessions, activityLog, notifications } from '@/db/schema';
import { eq, and, gte, desc, sql, or } from 'drizzle-orm';

// Helper function to get authenticated user from session
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const sessionResult = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return null;
    }

    const session = sessionResult[0];
    const expiresAt = new Date(session.expiresAt);
    
    if (expiresAt < new Date()) {
      return null;
    }

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userResult.length === 0) {
      return null;
    }

    return userResult[0];
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Helper function to log activity
async function logActivity(userId: number, role: string, action: string, metadata?: any) {
  try {
    await db.insert(activityLog).values({
      userId,
      role,
      action,
      metadata: metadata ? JSON.stringify(metadata) : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Activity log error:', error);
  }
}

// Helper function to create notification
async function createNotification(userId: number, type: string, title: string, message: string, relatedId?: string) {
  try {
    await db.insert(notifications).values({
      userId,
      type,
      title,
      message,
      relatedId,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Notification creation error:', error);
  }
}

// Helper function to notify all admins
async function notifyAllAdmins(title: string, message: string, relatedId?: string) {
  try {
    const admins = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, 'admin'));

    for (const admin of admins) {
      await createNotification(admin.id, 'event', title, message, relatedId);
    }
  } catch (error) {
    console.error('Admin notification error:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const branch = searchParams.get('branch');
    const dateFilter = searchParams.get('date');
    const statusParam = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const isAdmin = user.role === 'admin';
    const currentDate = new Date().toISOString();

    // Build where conditions
    const conditions: any[] = [];

    // Status filtering based on role
    if (isAdmin && statusParam) {
      conditions.push(eq(events.status, statusParam));
    } else if (!isAdmin) {
      // Non-admin users only see approved events with future start dates
      conditions.push(eq(events.status, 'approved'));
      conditions.push(gte(events.startDate, currentDate));
    }

    // Category filter
    if (category) {
      const validCategories = ['workshop', 'webinar', 'meetup', 'conference', 'social'];
      if (!validCategories.includes(category)) {
        return NextResponse.json({ error: 'Invalid category', code: 'INVALID_CATEGORY' }, { status: 400 });
      }
      conditions.push(eq(events.category, category));
    }

    // Branch filter
    if (branch) {
      conditions.push(eq(events.branch, branch));
    }

    // Date filter
    if (dateFilter) {
      conditions.push(gte(events.startDate, dateFilter));
    }

    // Fetch events with organizer details
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
    
    const eventsList = await db
      .select({
        id: events.id,
        organizerId: events.organizerId,
        title: events.title,
        description: events.description,
        location: events.location,
        startDate: events.startDate,
        endDate: events.endDate,
        category: events.category,
        maxAttendees: events.maxAttendees,
        isPaid: events.isPaid,
        price: events.price,
        imageUrl: events.imageUrl,
        status: events.status,
        branch: events.branch,
        approvedBy: events.approvedBy,
        approvedAt: events.approvedAt,
        createdAt: events.createdAt,
        organizer: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(whereCondition)
      .orderBy(events.startDate)
      .limit(limit)
      .offset(offset);

    // Get RSVP counts for each event
    const eventsWithCounts = await Promise.all(
      eventsList.map(async (event) => {
        const rsvpCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(rsvps)
          .where(and(
            eq(rsvps.eventId, event.id),
            eq(rsvps.status, 'registered')
          ));

        const rsvpCount = rsvpCountResult[0]?.count || 0;

        return {
          ...event,
          rsvpCount,
        };
      })
    );

    // Log activity
    await logActivity(user.id, user.role, 'view_events', { 
      category, 
      branch, 
      date: dateFilter,
      status: statusParam,
      count: eventsWithCounts.length 
    });

    return NextResponse.json(eventsWithCounts, { status: 200 });
  } catch (error) {
    console.error('GET events error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    // Validate user role
    if (user.role === 'student') {
      return NextResponse.json({ 
        error: 'Students cannot create events', 
        code: 'FORBIDDEN_ROLE' 
      }, { status: 403 });
    }

    if (!['alumni', 'faculty', 'admin'].includes(user.role)) {
      return NextResponse.json({ 
        error: 'Only alumni, faculty, and admin can create events', 
        code: 'FORBIDDEN_ROLE' 
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      category,
      maxAttendees,
      isPaid,
      price,
      imageUrl,
      branch,
    } = body;

    // Validate required fields
    if (!title || !description || !location || !startDate || !endDate || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, description, location, startDate, endDate, category', 
        code: 'MISSING_REQUIRED_FIELDS' 
      }, { status: 400 });
    }

    // Validate category
    const validCategories = ['workshop', 'webinar', 'meetup', 'conference', 'social'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ 
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`, 
        code: 'INVALID_CATEGORY' 
      }, { status: 400 });
    }

    // Validate dates
    const currentDate = new Date();
    const eventStartDate = new Date(startDate);
    const eventEndDate = new Date(endDate);

    if (eventStartDate <= currentDate) {
      return NextResponse.json({ 
        error: 'Start date must be in the future', 
        code: 'INVALID_START_DATE' 
      }, { status: 400 });
    }

    if (eventEndDate <= currentDate) {
      return NextResponse.json({ 
        error: 'End date must be in the future', 
        code: 'INVALID_END_DATE' 
      }, { status: 400 });
    }

    if (eventEndDate <= eventStartDate) {
      return NextResponse.json({ 
        error: 'End date must be after start date', 
        code: 'INVALID_DATE_RANGE' 
      }, { status: 400 });
    }

    // Validate paid event requirements
    if (isPaid === true && !price) {
      return NextResponse.json({ 
        error: 'Price is required for paid events', 
        code: 'MISSING_PRICE' 
      }, { status: 400 });
    }

    // Determine status based on role
    const eventStatus = user.role === 'admin' ? 'approved' : 'pending';

    // Create event
    const newEvent = await db
      .insert(events)
      .values({
        organizerId: user.id,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startDate,
        endDate,
        category,
        maxAttendees: maxAttendees || null,
        isPaid: isPaid || false,
        price: price ? price.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        status: eventStatus,
        branch: branch ? branch.trim() : null,
        approvedBy: user.role === 'admin' ? user.id : null,
        approvedAt: user.role === 'admin' ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    const createdEvent = newEvent[0];

    // Log activity
    await logActivity(user.id, user.role, 'create_event', { 
      eventId: createdEvent.id,
      status: eventStatus,
      title: createdEvent.title,
      category: createdEvent.category,
    });

    // Notify admins if event is pending approval
    if (eventStatus === 'pending') {
      await notifyAllAdmins(
        'New Event Pending Approval',
        `${user.name} has created a new event "${title}" that requires approval.`,
        createdEvent.id.toString()
      );
    }

    return NextResponse.json(createdEvent, { status: 201 });
  } catch (error) {
    console.error('POST events error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + (error as Error).message }, { status: 500 });
  }
}
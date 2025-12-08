import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  events,
  rsvps,
  activityLog,
  notifications,
  users,
  sessions,
} from "@/db/schema";
import { eq } from "drizzle-orm";

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0) return null;

    const sessionData = session[0];
    const expiresAt = new Date(sessionData.expiresAt);
    if (expiresAt < new Date()) return null;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionData.userId))
      .limit(1);

    return user.length > 0 ? user[0] : null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const eventId = parseInt(id);
    const body = await request.json();

    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.startDate !== undefined)
      updateData.startDate = new Date(body.startDate).toISOString();
    if (body.endDate !== undefined)
      updateData.endDate = new Date(body.endDate).toISOString();
    if (body.category !== undefined) updateData.category = body.category;
    if (body.maxAttendees !== undefined)
      updateData.maxAttendees = body.maxAttendees;
    if (body.isPaid !== undefined) updateData.isPaid = body.isPaid;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.status !== undefined) updateData.status = body.status;

    const [updatedEvent] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, eventId))
      .returning();

    // Notify attendees of changes
    const attendees = await db
      .select()
      .from(rsvps)
      .where(eq(rsvps.eventId, eventId));

    for (const attendee of attendees) {
      await db.insert(notifications).values({
        userId: attendee.userId,
        type: "event_update",
        title: "Event Updated",
        message: `The event "${updatedEvent.title}" has been updated`,
        relatedId: eventId,
        relatedType: "event",
        createdAt: new Date().toISOString(),
      });
    }

    // Log the action
    await db.insert(activityLog).values({
      userId: user.id,
      role: "admin",
      action: "update_event",
      metadata: JSON.stringify({
        eventId,
        changes: Object.keys(updateData),
      }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const eventId = parseInt(id);

    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get attendees before deletion
    const attendees = await db
      .select()
      .from(rsvps)
      .where(eq(rsvps.eventId, eventId));

    // Notify attendees of cancellation
    for (const attendee of attendees) {
      await db.insert(notifications).values({
        userId: attendee.userId,
        type: "event_cancelled",
        title: "Event Cancelled",
        message: `The event "${existingEvent.title}" has been cancelled`,
        relatedId: eventId,
        relatedType: "event",
        createdAt: new Date().toISOString(),
      });
    }

    // Delete RSVPs
    await db.delete(rsvps).where(eq(rsvps.eventId, eventId));

    // Delete event
    await db.delete(events).where(eq(events.id, eventId));

    // Log the action
    await db.insert(activityLog).values({
      userId: user.id,
      role: "admin",
      action: "delete_event",
      metadata: JSON.stringify({
        eventId,
        title: existingEvent.title,
        attendeesNotified: attendees.length,
      }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

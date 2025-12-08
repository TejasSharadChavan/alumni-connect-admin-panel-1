import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, activityLog, users, sessions } from "@/db/schema";
import { eq, and, like, or, desc } from "drizzle-orm";

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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query = db.select().from(events);
    const conditions = [];

    if (status) {
      conditions.push(eq(events.status, status));
    }
    if (category) {
      conditions.push(eq(events.category, category));
    }
    if (search) {
      conditions.push(
        or(
          like(events.title, `%${search}%`),
          like(events.description, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const allEvents = await query.orderBy(desc(events.createdAt));

    return NextResponse.json({ events: allEvents, total: allEvents.length });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
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
    } = body;

    if (
      !title ||
      !description ||
      !location ||
      !startDate ||
      !endDate ||
      !category
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newEvent] = await db
      .insert(events)
      .values({
        organizerId: user.id,
        title,
        description,
        location,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        category,
        maxAttendees: maxAttendees || null,
        isPaid: isPaid || false,
        price: price || null,
        imageUrl: imageUrl || null,
        status: "approved", // Admin events are auto-approved
        approvedBy: user.id,
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    // Log the action
    await db.insert(activityLog).values({
      userId: user.id,
      role: "admin",
      action: "create_event",
      metadata: JSON.stringify({ eventId: newEvent.id, title }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

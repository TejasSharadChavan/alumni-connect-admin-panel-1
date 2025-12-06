import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  connections,
  users,
  sessions,
  activityLog,
  notifications,
} from "@/db/schema";
import { eq, and, or, desc } from "drizzle-orm";

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

    if (session.length === 0) {
      return null;
    }

    const sessionData = session[0];
    const expiresAt = new Date(sessionData.expiresAt);

    if (expiresAt < new Date()) {
      return null;
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionData.userId))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    let whereConditions = or(
      eq(connections.requesterId, user.id),
      eq(connections.responderId, user.id)
    );

    if (
      statusFilter &&
      ["pending", "accepted", "rejected"].includes(statusFilter)
    ) {
      whereConditions = and(
        or(
          eq(connections.requesterId, user.id),
          eq(connections.responderId, user.id)
        ),
        eq(connections.status, statusFilter)
      );
    }

    const userConnections = await db
      .select({
        id: connections.id,
        requesterId: connections.requesterId,
        responderId: connections.responderId,
        status: connections.status,
        message: connections.message,
        createdAt: connections.createdAt,
        respondedAt: connections.respondedAt,
        requesterName: users.name,
        requesterEmail: users.email,
        requesterRole: users.role,
        requesterBranch: users.branch,
        requesterCohort: users.cohort,
        requesterProfileImageUrl: users.profileImageUrl,
        requesterHeadline: users.headline,
      })
      .from(connections)
      .leftJoin(users, eq(users.id, connections.requesterId))
      .where(whereConditions)
      .orderBy(desc(connections.createdAt))
      .limit(limit)
      .offset(offset);

    const results = await Promise.all(
      userConnections.map(async (connection) => {
        const isRequester = connection.requesterId === user.id;
        const otherUserId = isRequester
          ? connection.responderId
          : connection.requesterId;

        let otherUserData;
        if (isRequester) {
          const responderData = await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              role: users.role,
              branch: users.branch,
              cohort: users.cohort,
              profileImageUrl: users.profileImageUrl,
              headline: users.headline,
            })
            .from(users)
            .where(eq(users.id, otherUserId))
            .limit(1);

          otherUserData = responderData[0];
        } else {
          otherUserData = {
            id: connection.requesterId,
            name: connection.requesterName,
            email: connection.requesterEmail,
            role: connection.requesterRole,
            branch: connection.requesterBranch,
            cohort: connection.requesterCohort,
            profileImageUrl: connection.requesterProfileImageUrl,
            headline: connection.requesterHeadline,
          };
        }

        return {
          id: connection.id,
          requesterId: connection.requesterId,
          responderId: connection.responderId,
          status: connection.status,
          message: connection.message,
          createdAt: connection.createdAt,
          respondedAt: connection.respondedAt,
          connectedUser: otherUserData,
          isRequester,
        };
      })
    );

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: "view_connections",
      metadata: JSON.stringify({ statusFilter, limit, offset }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        connections: results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET connections error:", error);
    return NextResponse.json(
      {
        error: "Internal server error: " + (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { responderId, message } = body;

    if (!responderId) {
      return NextResponse.json(
        {
          error: "Responder ID is required",
          code: "MISSING_RESPONDER_ID",
        },
        { status: 400 }
      );
    }

    if (
      typeof responderId !== "number" ||
      isNaN(responderId) ||
      responderId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid responder ID",
          code: "INVALID_RESPONDER_ID",
        },
        { status: 400 }
      );
    }

    if (responderId === user.id) {
      return NextResponse.json(
        {
          error: "Cannot send connection request to yourself",
          code: "CANNOT_CONNECT_TO_SELF",
        },
        { status: 400 }
      );
    }

    const responder = await db
      .select()
      .from(users)
      .where(eq(users.id, responderId))
      .limit(1);

    if (responder.length === 0) {
      return NextResponse.json(
        {
          error: "Responder user not found",
          code: "RESPONDER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    if (
      responder[0].status !== "active" &&
      responder[0].status !== "approved"
    ) {
      return NextResponse.json(
        {
          error: "Responder user is not active",
          code: "RESPONDER_NOT_ACTIVE",
        },
        { status: 400 }
      );
    }

    const existingConnection = await db
      .select()
      .from(connections)
      .where(
        or(
          and(
            eq(connections.requesterId, user.id),
            eq(connections.responderId, responderId)
          ),
          and(
            eq(connections.requesterId, responderId),
            eq(connections.responderId, user.id)
          )
        )
      )
      .limit(1);

    if (existingConnection.length > 0) {
      return NextResponse.json(
        {
          error: "Connection already exists between these users",
          code: "CONNECTION_ALREADY_EXISTS",
        },
        { status: 400 }
      );
    }

    const newConnection = await db
      .insert(connections)
      .values({
        requesterId: user.id,
        responderId: responderId,
        status: "pending",
        message: message ? message.trim() : null,
        createdAt: new Date().toISOString(),
        respondedAt: null,
      })
      .returning();

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: "send_connection_request",
      metadata: JSON.stringify({ responderId }),
      timestamp: new Date().toISOString(),
    });

    await db.insert(notifications).values({
      userId: responderId,
      type: "connection",
      title: "New Connection Request",
      message: `${user.name} sent you a connection request`,
      relatedId: newConnection[0].id.toString(),
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(newConnection[0], { status: 201 });
  } catch (error) {
    console.error("POST connections error:", error);
    return NextResponse.json(
      {
        error: "Internal server error: " + (error as Error).message,
      },
      { status: 500 }
    );
  }
}

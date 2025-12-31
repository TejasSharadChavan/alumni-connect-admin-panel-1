import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  mentorshipRequests,
  users,
  sessions,
  notifications,
} from "@/db/schema";
import { eq } from "drizzle-orm";

async function validateSession(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const session = await db
      .select({
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

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session[0].userId))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateSession(request);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Get the mentorship request
    const [mentorshipRequest] = await db
      .select()
      .from(mentorshipRequests)
      .where(eq(mentorshipRequests.id, requestId))
      .limit(1);

    if (!mentorshipRequest) {
      return NextResponse.json(
        { error: "Mentorship request not found" },
        { status: 404 }
      );
    }

    // Only the mentor can reject the request
    if (mentorshipRequest.mentorId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to reject this request" },
        { status: 403 }
      );
    }

    const currentTimestamp = new Date().toISOString();

    // Update the request status to rejected
    const [updatedRequest] = await db
      .update(mentorshipRequests)
      .set({
        status: "rejected",
        respondedAt: currentTimestamp,
      })
      .where(eq(mentorshipRequests.id, requestId))
      .returning();

    // Create notification for the student
    await db.insert(notifications).values({
      userId: mentorshipRequest.studentId,
      type: "mentorship",
      title: "Mentorship Request Declined",
      message: `${user.name} has declined your mentorship request.`,
      relatedId: requestId.toString(),
      isRead: false,
      createdAt: currentTimestamp,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Mentorship request declined successfully",
        request: updatedRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reject mentorship request error:", error);
    return NextResponse.json(
      {
        error:
          "Internal server error: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}

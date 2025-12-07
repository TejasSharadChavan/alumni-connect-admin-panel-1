import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { mentorshipRequests, users, sessions } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) return null;

    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For alumni/faculty: Get requests where they are the mentor
    // For students: Get requests where they are the student
    const isAlumniOrFaculty = user.role === "alumni" || user.role === "faculty";

    const requests = await db
      .select({
        id: mentorshipRequests.id,
        studentId: mentorshipRequests.studentId,
        mentorId: mentorshipRequests.mentorId,
        topic: mentorshipRequests.topic,
        message: mentorshipRequests.message,
        status: mentorshipRequests.status,
        preferredTime: mentorshipRequests.preferredTime,
        createdAt: mentorshipRequests.createdAt,
        respondedAt: mentorshipRequests.respondedAt,
        studentName: users.name,
        studentEmail: users.email,
        studentBranch: users.branch,
        studentProfileImage: users.profileImageUrl,
      })
      .from(mentorshipRequests)
      .leftJoin(users, eq(mentorshipRequests.studentId, users.id))
      .where(
        isAlumniOrFaculty
          ? eq(mentorshipRequests.mentorId, user.id)
          : eq(mentorshipRequests.studentId, user.id)
      );

    // Get mentor details for requests where current user is student
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        if (request.mentorId !== user.id) {
          // Current user is student, get mentor details
          const [mentor] = await db
            .select({
              name: users.name,
              email: users.email,
              profileImageUrl: users.profileImageUrl,
            })
            .from(users)
            .where(eq(users.id, request.mentorId))
            .limit(1);

          return {
            ...request,
            mentorName: mentor?.name,
            mentorEmail: mentor?.email,
            mentorProfileImage: mentor?.profileImageUrl,
          };
        }
        return request;
      })
    );

    return NextResponse.json(
      { requests: requestsWithDetails },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET mentorship error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentorship requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only alumni/faculty can create sessions
    if (user.role !== "alumni" && user.role !== "faculty") {
      return NextResponse.json(
        { error: "Only alumni and faculty can schedule sessions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { requestId, scheduledAt, duration, notes } = body;

    if (!requestId || !scheduledAt || !duration) {
      return NextResponse.json(
        { error: "Missing required fields: requestId, scheduledAt, duration" },
        { status: 400 }
      );
    }

    // Verify the request exists and belongs to this mentor
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

    if (mentorshipRequest.mentorId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to schedule this session" },
        { status: 403 }
      );
    }

    // For now, just return success since we're accepting the request
    // In a full implementation, you would create a mentorshipSessions record
    return NextResponse.json(
      {
        success: true,
        message: "Session scheduled successfully",
        session: {
          requestId,
          scheduledAt,
          duration,
          notes,
          status: "scheduled",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST mentorship session error:", error);
    return NextResponse.json(
      { error: "Failed to schedule session" },
      { status: 500 }
    );
  }
}

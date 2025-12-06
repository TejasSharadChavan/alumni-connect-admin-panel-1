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

    // Get all mentorship requests where user is either mentor or student
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
        or(
          eq(mentorshipRequests.mentorId, user.id),
          eq(mentorshipRequests.studentId, user.id)
        )
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

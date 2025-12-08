import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all stats in parallel
    const [
      totalUsersResult,
      pendingUsersResult,
      studentsResult,
      alumniResult,
      facultyResult,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`${users.status} IN ('approved', 'active')`),
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.status, "pending")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(
          sql`${users.role} = 'student' AND ${users.status} IN ('approved', 'active')`
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(
          sql`${users.role} = 'alumni' AND ${users.status} IN ('approved', 'active')`
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(
          sql`${users.role} = 'faculty' AND ${users.status} IN ('approved', 'active')`
        ),
    ]);

    const stats = {
      totalUsers: Number(totalUsersResult[0]?.count || 0),
      pendingApprovals: Number(pendingUsersResult[0]?.count || 0),
      students: Number(studentsResult[0]?.count || 0),
      alumni: Number(alumniResult[0]?.count || 0),
      faculty: Number(facultyResult[0]?.count || 0),
    };

    return NextResponse.json({ success: true, stats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

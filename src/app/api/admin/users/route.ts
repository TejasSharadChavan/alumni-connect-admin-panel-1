import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions, activityLog } from "@/db/schema";
import { eq, or, like, and, sql } from "drizzle-orm";

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.substring(7);
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user || null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");
    const statusFilter = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let conditions: any[] = [];

    if (roleFilter && roleFilter !== "all") {
      conditions.push(eq(users.role, roleFilter));
    }

    if (statusFilter && statusFilter !== "all") {
      conditions.push(eq(users.status, statusFilter));
    }

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          like(users.name, searchPattern),
          like(users.email, searchPattern),
          like(users.branch, searchPattern),
          like(users.department, searchPattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [allUsers, [{ count: totalCount }]] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          status: users.status,
          branch: users.branch,
          cohort: users.cohort,
          yearOfPassing: users.yearOfPassing,
          department: users.department,
          headline: users.headline,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereClause),
    ]);

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: "admin_view_users",
      metadata: JSON.stringify({
        filters: { roleFilter, statusFilter, search },
        count: allUsers.length,
      }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      users: allUsers,
      total: Number(totalCount),
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

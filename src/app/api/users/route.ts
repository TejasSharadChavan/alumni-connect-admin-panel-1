import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, ne, or, and, like } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Get current user from token
    const { sessions } = await import("@/db/schema");
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const branch = searchParams.get("branch");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");

    // Build query conditions
    let conditions: any[] = [
      ne(users.id, currentUser.id), // Exclude current user
      ne(users.status, "inactive"), // Exclude inactive users
      ne(users.status, "rejected"), // Exclude rejected users
    ];

    if (role && role !== "all") {
      conditions.push(eq(users.role, role));

      // Additional validation for students
      if (role === "student") {
        conditions.push(
          and(
            ne(users.name, ""), // Must have name
            ne(users.email, ""), // Must have email
            ne(users.branch, ""), // Must have branch
            ne(users.cohort, "") // Must have cohort
          )
        );
      }
    }

    if (branch && branch !== "all") {
      conditions.push(eq(users.branch, branch));
    }

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          like(users.name, searchPattern),
          like(users.headline, searchPattern),
          like(users.bio, searchPattern)
        )
      );
    }

    // Fetch users
    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        branch: users.branch,
        cohort: users.cohort,
        yearOfPassing: users.yearOfPassing,
        headline: users.headline,
        bio: users.bio,
        skills: users.skills,
        profileImageUrl: users.profileImageUrl,
        linkedinUrl: users.linkedinUrl,
        githubUrl: users.githubUrl,
      })
      .from(users)
      .where(and(...conditions));

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const allUsers = await query;

    return NextResponse.json({
      users: allUsers,
      total: allUsers.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectSubmissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
    });

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let allSubmissions;
    
    if (user.role === "student") {
      allSubmissions = await db.select()
        .from(projectSubmissions)
        .where(eq(projectSubmissions.submittedBy, user.id));
    } else if (user.role === "faculty") {
      allSubmissions = await db.select()
        .from(projectSubmissions);
    } else {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const stats = {
      total: allSubmissions.length,
      pending: allSubmissions.filter(s => s.status === "pending").length,
      approved: allSubmissions.filter(s => s.status === "approved").length,
      rejected: allSubmissions.filter(s => s.status === "rejected").length,
      revisionRequested: allSubmissions.filter(s => s.status === "revision_requested").length,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching submission stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectSubmissions, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!user || user.role !== "faculty") {
      return NextResponse.json(
        { error: "Only faculty can review submissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const submissionId = parseInt(id);

    const existing = await db.query.projectSubmissions.findFirst({
      where: (projectSubmissions, { eq }) =>
        eq(projectSubmissions.id, submissionId),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { action, comments, grade } = body;

    if (
      !action ||
      !["approve", "reject", "request_revision"].includes(action)
    ) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const statusMap: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      request_revision: "revision_requested",
    };

    const updateData: any = {
      status: statusMap[action],
      reviewedBy: user.id,
      reviewedAt: now,
      reviewComments: comments || null,
      updatedAt: now,
    };

    if (grade !== undefined && grade !== null) {
      updateData.grade = grade;
    }

    const [updated] = await db
      .update(projectSubmissions)
      .set(updateData)
      .where(eq(projectSubmissions.id, submissionId))
      .returning();

    // Create notification for student
    const notificationMessages: Record<string, string> = {
      approve: "Your project submission has been approved!",
      reject:
        "Your project submission was rejected. Please review the feedback.",
      request_revision:
        "Your project submission needs revision. Please check the comments.",
    };

    await db.insert(notifications).values({
      userId: existing.submittedBy,
      type: "project",
      title: `Project Review: ${existing.title}`,
      message: notificationMessages[action],
      relatedId: submissionId.toString(),
      isRead: false,
      createdAt: now,
    });

    return NextResponse.json({ submission: updated });
  } catch (error) {
    console.error("Error reviewing submission:", error);
    return NextResponse.json(
      { error: "Failed to review submission" },
      { status: 500 }
    );
  }
}

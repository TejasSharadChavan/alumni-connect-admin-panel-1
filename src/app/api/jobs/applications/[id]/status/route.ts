import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  applications,
  jobs,
  users,
  sessions,
  notifications,
} from "@/db/schema";
import { eq } from "drizzle-orm";

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
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const applicationId = parseInt(id);
    const { status } = await request.json();

    // Validate status
    const validStatuses = ["applied", "interview", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get application details
    const appResults = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        applicantId: applications.applicantId,
        currentStatus: applications.status,
      })
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);

    if (appResults.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const application = appResults[0];

    // Get job details to verify ownership
    const jobResults = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, application.jobId))
      .limit(1);

    if (jobResults.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobResults[0];

    // Only job poster or admin can update status
    if (job.postedById !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to update this application" },
        { status: 403 }
      );
    }

    // Update application status
    await db
      .update(applications)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(applications.id, applicationId));

    // Send notification to student
    const notificationMessages: Record<string, string> = {
      interview: `Your application for ${job.title} has been shortlisted for interview!`,
      accepted: `Congratulations! Your application for ${job.title} has been accepted!`,
      rejected: `Your application for ${job.title} has been reviewed. Thank you for your interest.`,
    };

    if (notificationMessages[status]) {
      await db.insert(notifications).values({
        userId: application.applicantId,
        type: "application",
        title: "Application Status Update",
        message: notificationMessages[status],
        relatedId: applicationId.toString(),
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully",
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
}

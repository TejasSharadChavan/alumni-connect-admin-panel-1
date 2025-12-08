import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, applications, activityLog, users, sessions } from "@/db/schema";
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
    console.error("Authentication error:", error);
    return null;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const jobId = parseInt(id);

    const [existingJob] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId));

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Delete applications first (cascade)
    await db.delete(applications).where(eq(applications.jobId, jobId));

    // Delete the job
    await db.delete(jobs).where(eq(jobs.id, jobId));

    // Log the action
    await db.insert(activityLog).values({
      userId: user.id,
      role: "admin",
      action: "delete_job",
      metadata: JSON.stringify({
        jobId,
        title: existingJob.title,
        company: existingJob.company,
      }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const jobId = parseInt(id);
    const body = await request.json();

    const [existingJob] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId));

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.company !== undefined) updateData.company = body.company;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.jobType !== undefined) updateData.jobType = body.jobType;
    if (body.salary !== undefined) updateData.salary = body.salary;
    if (body.requirements !== undefined)
      updateData.requirements = body.requirements;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.skills !== undefined) {
      updateData.skills = Array.isArray(body.skills)
        ? JSON.stringify(body.skills)
        : body.skills;
    }

    const [updatedJob] = await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, jobId))
      .returning();

    // Log the action
    await db.insert(activityLog).values({
      userId: user.id,
      role: "admin",
      action: "update_job",
      metadata: JSON.stringify({
        jobId,
        changes: Object.keys(updateData),
      }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ job: updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, jobs, users, sessions } from "@/db/schema";
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);

    // Get job details and verify ownership
    const jobResults = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (jobResults.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobResults[0];

    // Only job poster or admin can view applicants
    if (job.postedById !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to view applicants" },
        { status: 403 }
      );
    }

    // Get all applications for this job with student details
    const jobApplications = await db
      .select({
        id: applications.id,
        status: applications.status,
        appliedAt: applications.appliedAt,
        coverLetter: applications.coverLetter,
        resumeUrl: applications.resumeUrl,
        studentId: applications.applicantId,
        studentName: users.name,
        studentEmail: users.email,
        studentPhone: users.phone,
        studentBranch: users.branch,
        studentCohort: users.cohort,
      })
      .from(applications)
      .innerJoin(users, eq(applications.applicantId, users.id))
      .where(eq(applications.jobId, jobId));

    const formattedApplicants = jobApplications.map((app) => ({
      id: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      coverLetter: app.coverLetter,
      resumeUrl: app.resumeUrl,
      student: {
        id: app.studentId,
        name: app.studentName,
        email: app.studentEmail,
        phone: app.studentPhone,
        branch: app.studentBranch,
        cohort: app.studentCohort,
      },
    }));

    return NextResponse.json({
      success: true,
      applicants: formattedApplicants,
      jobTitle: job.title,
    });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}

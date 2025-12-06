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

    // Get all applications for the current student
    const userApplications = await db
      .select({
        id: applications.id,
        status: applications.status,
        appliedAt: applications.appliedAt,
        coverLetter: applications.coverLetter,
        resumeUrl: applications.resumeUrl,
        jobId: applications.jobId,
        jobTitle: jobs.title,
        jobCompany: jobs.company,
        jobLocation: jobs.location,
        jobSalary: jobs.salary,
        jobType: jobs.jobType,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.applicantId, user.id))
      .orderBy(applications.appliedAt);

    // Format the response
    const formattedApplications = userApplications.map((app) => ({
      id: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      coverLetter: app.coverLetter,
      resumeUrl: app.resumeUrl,
      job: {
        id: app.jobId,
        title: app.jobTitle,
        company: app.jobCompany,
        location: app.jobLocation,
        salary: app.jobSalary,
        jobType: app.jobType,
      },
    }));

    return NextResponse.json({
      success: true,
      applications: formattedApplications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

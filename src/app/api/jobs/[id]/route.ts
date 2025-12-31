import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, users, sessions } from "@/db/schema";
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
    console.log("API: Received job ID:", id);
    const jobId = parseInt(id);

    if (isNaN(jobId)) {
      console.error("API: Invalid job ID:", id);
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    console.log("API: Parsed job ID:", jobId);

    // Get job details with poster information
    const jobResults = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        company: jobs.company,
        description: jobs.description,
        location: jobs.location,
        jobType: jobs.jobType,
        salary: jobs.salary,
        skills: jobs.skills,
        branch: jobs.branch,
        postedById: jobs.postedById,
        status: jobs.status,
        createdAt: jobs.createdAt,
        expiresAt: jobs.expiresAt,
        postedByName: users.name,
        postedByEmail: users.email,
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.postedById, users.id))
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (jobResults.length === 0) {
      console.error("API: Job not found in database for ID:", jobId);
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobResults[0];
    console.log("API: Found job:", job.title);

    const response = {
      success: true,
      job: {
        ...job,
        postedByName: job.postedByName || job.postedByEmail || "Unknown",
      },
    };

    console.log("API: Returning response with success:", response.success);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching job details:", error);
    return NextResponse.json(
      { error: "Failed to fetch job details" },
      { status: 500 }
    );
  }
}

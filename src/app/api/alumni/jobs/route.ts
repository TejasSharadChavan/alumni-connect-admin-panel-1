import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, users, sessions } from "@/db/schema";
import { eq, and, desc, gt } from "drizzle-orm";

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const session = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date().toISOString())
      )
    )
    .limit(1);

  if (session.length === 0) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session[0].userId))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "alumni") {
      return NextResponse.json(
        { error: "Only alumni can access this endpoint" },
        { status: 403 }
      );
    }

    // Get jobs posted by this alumni
    const alumniJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        company: jobs.company,
        description: jobs.description,
        location: jobs.location,
        jobType: jobs.jobType,
        salary: jobs.salary,
        skills: jobs.skills,
        status: jobs.status,
        createdAt: jobs.createdAt,
        expiresAt: jobs.expiresAt,
      })
      .from(jobs)
      .where(eq(jobs.postedById, user.id))
      .orderBy(desc(jobs.createdAt));

    // Parse skills for each job
    const jobsWithParsedSkills = alumniJobs.map((job) => ({
      ...job,
      skills:
        typeof job.skills === "string"
          ? job.skills
            ? JSON.parse(job.skills)
            : []
          : Array.isArray(job.skills)
            ? job.skills
            : [],
    }));

    return NextResponse.json({
      success: true,
      jobs: jobsWithParsedSkills,
    });
  } catch (error) {
    console.error("Get alumni jobs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

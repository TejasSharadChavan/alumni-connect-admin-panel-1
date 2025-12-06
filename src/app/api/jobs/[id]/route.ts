import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = parseInt(params.id);

    if (isNaN(jobId)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    const job = await db
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
        status: jobs.status,
        createdAt: jobs.createdAt,
        postedById: jobs.postedById,
      })
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (job.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Get poster info
    const poster = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, job[0].postedById))
      .limit(1);

    return NextResponse.json({
      ...job[0],
      postedBy: poster[0]?.name || "Unknown",
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

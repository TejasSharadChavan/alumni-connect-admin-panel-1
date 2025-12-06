import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, jobs, userSkills } from "@/db/schema";
import { eq } from "drizzle-orm";

// Calculate job match percentage based on skills and profile
function calculateJobMatch(userProfile: any, job: any): number {
  let totalScore = 0;
  let maxScore = 100;

  // Parse job skills
  let jobSkills: string[] = [];
  if (typeof job.skills === "string") {
    try {
      jobSkills = JSON.parse(job.skills);
    } catch {
      jobSkills = [];
    }
  } else if (Array.isArray(job.skills)) {
    jobSkills = job.skills;
  }

  // Parse user skills
  let userSkillsList: string[] = [];
  if (typeof userProfile.skills === "string") {
    try {
      userSkillsList = JSON.parse(userProfile.skills);
    } catch {
      userSkillsList = [];
    }
  } else if (Array.isArray(userProfile.skills)) {
    userSkillsList = userProfile.skills;
  }

  // 1. Skills Match (60% weight)
  if (jobSkills.length > 0 && userSkillsList.length > 0) {
    const matchingSkills = jobSkills.filter((skill) =>
      userSkillsList.some(
        (userSkill) =>
          userSkill.toLowerCase() === skill.toLowerCase() ||
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    const skillsScore = (matchingSkills.length / jobSkills.length) * 60;
    totalScore += skillsScore;
  } else {
    totalScore += 30; // Default if no skills data
  }

  // 2. Branch Match (20% weight)
  if (job.branch && userProfile.branch) {
    if (job.branch.toLowerCase() === userProfile.branch.toLowerCase()) {
      totalScore += 20;
    } else {
      totalScore += 5; // Partial credit for having a branch
    }
  } else {
    totalScore += 10; // Default if no branch specified
  }

  // 3. Profile Completeness (20% weight)
  let completenessScore = 0;
  if (userProfile.headline) completenessScore += 5;
  if (userProfile.bio) completenessScore += 5;
  if (userProfile.resumeUrl) completenessScore += 5;
  if (userSkillsList.length > 0) completenessScore += 5;
  totalScore += completenessScore;

  return Math.min(Math.round(totalScore), 100);
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Get user from token (simplified - in production, verify JWT)
    const userResult = await db.select().from(users).limit(1);

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult[0];

    // Get job ID from query params
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (jobId) {
      // Get specific job match
      const jobResult = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, parseInt(jobId)))
        .limit(1);

      if (!jobResult || jobResult.length === 0) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      const job = jobResult[0];
      const matchScore = calculateJobMatch(user, job);

      return NextResponse.json({
        success: true,
        jobId: job.id,
        matchScore,
      });
    } else {
      // Get all jobs with match scores
      const allJobs = await db
        .select()
        .from(jobs)
        .where(eq(jobs.status, "approved"));

      const jobsWithMatches = allJobs.map((job) => ({
        jobId: job.id,
        matchScore: calculateJobMatch(user, job),
      }));

      return NextResponse.json({
        success: true,
        matches: jobsWithMatches,
      });
    }
  } catch (error) {
    console.error("Error calculating job match:", error);
    return NextResponse.json(
      { error: "Failed to calculate job match" },
      { status: 500 }
    );
  }
}

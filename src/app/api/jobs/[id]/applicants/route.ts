import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, jobs, users, sessions } from "@/db/schema";
import { eq, and, gt, desc } from "drizzle-orm";

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const jobId = parseInt(id);

    if (isNaN(jobId)) {
      return NextResponse.json(
        {
          error: "Invalid job ID",
          code: "INVALID_JOB_ID",
        },
        { status: 400 }
      );
    }

    // Verify user owns this job or is admin
    const job = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (job.length === 0) {
      return NextResponse.json(
        {
          error: "Job not found",
          code: "JOB_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const jobData = job[0];

    if (jobData.postedById !== user.id && user.role !== "admin") {
      return NextResponse.json(
        {
          error: "You can only view applicants for your own job postings",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url);
    const minScore = searchParams.get("minScore")
      ? parseInt(searchParams.get("minScore")!)
      : 0;
    const maxScore = searchParams.get("maxScore")
      ? parseInt(searchParams.get("maxScore")!)
      : 100;
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "appliedAt"; // 'appliedAt', 'matchingScore', 'name'
    const sortOrder = searchParams.get("sortOrder") || "desc"; // 'asc', 'desc'

    // Get all applicants for this job
    const applicantsQuery = db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        applicantId: applications.applicantId,
        resumeUrl: applications.resumeUrl,
        coverLetter: applications.coverLetter,
        resumeSummary: applications.resumeSummary,
        matchingScore: applications.matchingScore,
        skillsMatch: applications.skillsMatch,
        experienceMatch: applications.experienceMatch,
        strengthsWeaknesses: applications.strengthsWeaknesses,
        aiAnalysis: applications.aiAnalysis,
        referralCode: applications.referralCode,
        status: applications.status,
        appliedAt: applications.appliedAt,
        updatedAt: applications.updatedAt,
        applicant: {
          id: users.id,
          name: users.name,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
          headline: users.headline,
          branch: users.branch,
          cohort: users.cohort,
          yearOfPassing: users.yearOfPassing,
          skills: users.skills,
          linkedinUrl: users.linkedinUrl,
          githubUrl: users.githubUrl,
        },
      })
      .from(applications)
      .leftJoin(users, eq(applications.applicantId, users.id))
      .where(eq(applications.jobId, jobId));

    let applicants = await applicantsQuery;

    // Filter by status if provided
    if (status && status !== "all") {
      applicants = applicants.filter((app) => app.status === status);
    }

    // Filter by score range
    applicants = applicants.filter((app) => {
      const score = app.matchingScore || 0;
      return score >= minScore && score <= maxScore;
    });

    // Sort applicants
    applicants.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "matchingScore":
          aValue = a.matchingScore || 0;
          bValue = b.matchingScore || 0;
          break;
        case "name":
          aValue = a.applicant?.name || "";
          bValue = b.applicant?.name || "";
          break;
        case "appliedAt":
        default:
          aValue = new Date(a.appliedAt);
          bValue = new Date(b.appliedAt);
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Parse JSON fields
    const processedApplicants = applicants.map((app) => {
      let skillsMatch = [];
      let strengthsWeaknesses = { strengths: [], weaknesses: [] };
      let aiAnalysis = null;
      let applicantSkills = [];

      try {
        if (app.skillsMatch) {
          skillsMatch = JSON.parse(app.skillsMatch);
        }
      } catch (e) {
        skillsMatch = [];
      }

      try {
        if (app.strengthsWeaknesses) {
          strengthsWeaknesses = JSON.parse(app.strengthsWeaknesses);
        }
      } catch (e) {
        strengthsWeaknesses = { strengths: [], weaknesses: [] };
      }

      try {
        if (app.aiAnalysis) {
          aiAnalysis = JSON.parse(app.aiAnalysis);
        }
      } catch (e) {
        aiAnalysis = null;
      }

      try {
        if (app.applicant?.skills) {
          applicantSkills =
            typeof app.applicant.skills === "string"
              ? JSON.parse(app.applicant.skills)
              : app.applicant.skills;
        }
      } catch (e) {
        applicantSkills = [];
      }

      return {
        ...app,
        skillsMatch,
        strengthsWeaknesses,
        aiAnalysis,
        applicant: app.applicant
          ? {
              ...app.applicant,
              skills: applicantSkills,
            }
          : null,
      };
    });

    // Calculate statistics
    const stats = {
      total: applicants.length,
      byStatus: {
        applied: applicants.filter((app) => app.status === "applied").length,
        screening: applicants.filter((app) => app.status === "screening")
          .length,
        interview: applicants.filter((app) => app.status === "interview")
          .length,
        accepted: applicants.filter((app) => app.status === "accepted").length,
        rejected: applicants.filter((app) => app.status === "rejected").length,
      },
      averageScore:
        applicants.length > 0
          ? Math.round(
              applicants.reduce(
                (sum, app) => sum + (app.matchingScore || 0),
                0
              ) / applicants.length
            )
          : 0,
      scoreDistribution: {
        excellent: applicants.filter((app) => (app.matchingScore || 0) >= 80)
          .length,
        good: applicants.filter(
          (app) =>
            (app.matchingScore || 0) >= 60 && (app.matchingScore || 0) < 80
        ).length,
        fair: applicants.filter(
          (app) =>
            (app.matchingScore || 0) >= 40 && (app.matchingScore || 0) < 60
        ).length,
        poor: applicants.filter((app) => (app.matchingScore || 0) < 40).length,
      },
    };

    return NextResponse.json({
      success: true,
      job: {
        id: jobData.id,
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        jobType: jobData.jobType,
      },
      applicants: processedApplicants,
      stats,
      filters: {
        minScore,
        maxScore,
        status,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching job applicants:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch job applicants: " + (error as Error).message,
        code: "FETCH_FAILED",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const jobId = parseInt(id);
    const body = await request.json();
    const { applicationId, status, notes } = body;

    if (isNaN(jobId) || !applicationId || !status) {
      return NextResponse.json(
        {
          error: "Job ID, application ID, and status are required",
          code: "MISSING_FIELDS",
        },
        { status: 400 }
      );
    }

    // Verify user owns this job or is admin
    const job = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (job.length === 0) {
      return NextResponse.json(
        {
          error: "Job not found",
          code: "JOB_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const jobData = job[0];

    if (jobData.postedById !== user.id && user.role !== "admin") {
      return NextResponse.json(
        {
          error: "You can only update applications for your own job postings",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Validate status
    const validStatuses = [
      "applied",
      "screening",
      "interview",
      "rejected",
      "accepted",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be one of: " + validStatuses.join(", "),
          code: "INVALID_STATUS",
        },
        { status: 400 }
      );
    }

    // Update application status
    const updatedApplication = await db
      .update(applications)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(eq(applications.id, applicationId), eq(applications.jobId, jobId))
      )
      .returning();

    if (updatedApplication.length === 0) {
      return NextResponse.json(
        {
          error: "Application not found",
          code: "APPLICATION_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: updatedApplication[0],
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      {
        error:
          "Failed to update application status: " + (error as Error).message,
        code: "UPDATE_FAILED",
      },
      { status: 500 }
    );
  }
}

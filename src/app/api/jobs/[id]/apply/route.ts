import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  applications,
  jobs,
  users,
  sessions,
  activityLog,
  notifications,
  referrals,
  referralUsage,
} from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { analyzeResumeForJob, extractTextFromPDF } from "@/lib/openai";

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

export async function POST(request: NextRequest) {
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

    // Extract job ID from URL path
    const pathParts = request.nextUrl.pathname.split("/");
    const jobIdStr = pathParts[3];

    if (!jobIdStr || isNaN(parseInt(jobIdStr))) {
      return NextResponse.json(
        {
          error: "Valid job ID is required",
          code: "INVALID_JOB_ID",
        },
        { status: 400 }
      );
    }

    const jobId = parseInt(jobIdStr);

    // Validate user is a student
    if (user.role !== "student") {
      return NextResponse.json(
        {
          error: "Only students can apply to jobs",
          code: "NOT_STUDENT",
        },
        { status: 403 }
      );
    }

    // Parse request body for optional fields
    const body = await request.json();
    const { resumeUrl, coverLetter, referralCode, aiAnalysis } = body;

    // Validate referral code if provided
    let validReferral = null;
    if (referralCode && referralCode.trim()) {
      const referralResult = await db
        .select()
        .from(referrals)
        .where(eq(referrals.code, referralCode.trim().toUpperCase()))
        .limit(1);

      if (referralResult.length > 0) {
        const referral = referralResult[0];

        // Check if referral is active
        if (!referral.isActive) {
          return NextResponse.json(
            {
              error: "Referral code is inactive",
              code: "REFERRAL_INACTIVE",
            },
            { status: 400 }
          );
        }

        // Check if referral has expired
        if (referral.expiresAt && new Date(referral.expiresAt) < new Date()) {
          return NextResponse.json(
            {
              error: "Referral code has expired",
              code: "REFERRAL_EXPIRED",
            },
            { status: 400 }
          );
        }

        // Check if referral usage limit is reached
        if (referral.usedCount >= referral.maxUses) {
          return NextResponse.json(
            {
              error: "Referral code usage limit reached",
              code: "REFERRAL_LIMIT_REACHED",
            },
            { status: 400 }
          );
        }

        // Check if student has already used this referral code
        const existingUsage = await db
          .select()
          .from(referralUsage)
          .where(
            and(
              eq(referralUsage.referralId, referral.id),
              eq(referralUsage.studentId, user.id)
            )
          )
          .limit(1);

        if (existingUsage.length > 0) {
          return NextResponse.json(
            {
              error: "You have already used this referral code",
              code: "REFERRAL_ALREADY_USED",
            },
            { status: 400 }
          );
        }

        validReferral = referral;
      } else {
        return NextResponse.json(
          {
            error: "Invalid referral code",
            code: "REFERRAL_INVALID",
          },
          { status: 400 }
        );
      }
    }

    // Security check: reject if applicantId provided in body
    if ("applicantId" in body || "applicant_id" in body) {
      return NextResponse.json(
        {
          error: "Applicant ID cannot be provided in request body",
          code: "APPLICANT_ID_NOT_ALLOWED",
        },
        { status: 400 }
      );
    }

    // Validate job exists
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

    // Validate job is approved
    if (jobData.status !== "approved") {
      return NextResponse.json(
        {
          error: "Job is not approved",
          code: "JOB_NOT_APPROVED",
        },
        { status: 400 }
      );
    }

    // Validate job is not expired
    const currentDate = new Date().toISOString();
    if (jobData.expiresAt <= currentDate) {
      return NextResponse.json(
        {
          error: "Job posting has expired",
          code: "JOB_EXPIRED",
        },
        { status: 400 }
      );
    }

    // Check if user has already applied to this job
    const existingApplication = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.jobId, jobId),
          eq(applications.applicantId, user.id)
        )
      )
      .limit(1);

    if (existingApplication.length > 0) {
      return NextResponse.json(
        {
          error: "You have already applied to this job",
          code: "ALREADY_APPLIED",
        },
        { status: 400 }
      );
    }

    // Create application with AI analysis data
    const timestamp = new Date().toISOString();
    const applicationData: any = {
      jobId,
      applicantId: user.id,
      resumeUrl: resumeUrl || null,
      coverLetter: coverLetter || null,
      referralCode: referralCode || null,
      status: "applied",
      appliedAt: timestamp,
      updatedAt: timestamp,
    };

    // Include AI analysis if provided
    if (aiAnalysis) {
      applicationData.resumeSummary = aiAnalysis.summary;
      applicationData.matchingScore = aiAnalysis.matchingScore;
      applicationData.skillsMatch = JSON.stringify(
        aiAnalysis.skillsMatch || []
      );
      applicationData.experienceMatch = aiAnalysis.experienceMatch;
      applicationData.strengthsWeaknesses = JSON.stringify({
        strengths: aiAnalysis.strengths || [],
        weaknesses: aiAnalysis.weaknesses || [],
      });
      applicationData.aiAnalysis = JSON.stringify(aiAnalysis);
    }

    const newApplication = await db
      .insert(applications)
      .values(applicationData)
      .returning();

    // Update referral usage if referral code was used
    if (validReferral) {
      // Increment referral usage count
      await db
        .update(referrals)
        .set({
          usedCount: validReferral.usedCount + 1,
        })
        .where(eq(referrals.id, validReferral.id));

      // Create referral usage record
      await db.insert(referralUsage).values({
        referralId: validReferral.id,
        studentId: user.id,
        jobId: jobId,
        applicationId: newApplication[0].id,
        usedAt: timestamp,
      });

      // Create notification for alumni who created the referral
      await db.insert(notifications).values({
        userId: validReferral.alumniId,
        type: "referral",
        title: "Referral Code Used",
        message: `${user.name} used your referral code "${validReferral.code}" for ${jobData.title}`,
        relatedId: newApplication[0].id.toString(),
        isRead: false,
        createdAt: timestamp,
      });
    }

    // Log activity
    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: "apply_to_job",
      metadata: JSON.stringify({
        jobId,
        applicationId: newApplication[0].id,
      }),
      timestamp,
    });

    // Create notification for job poster
    await db.insert(notifications).values({
      userId: jobData.postedById,
      type: "job",
      title: "New Job Application",
      message: `${user.name} has applied to your job posting: ${jobData.title}`,
      relatedId: newApplication[0].id.toString(),
      isRead: false,
      createdAt: timestamp,
    });

    return NextResponse.json(newApplication[0], { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      {
        error: "Internal server error: " + (error as Error).message,
      },
      { status: 500 }
    );
  }
}

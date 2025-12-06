import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, users, sessions, activityLog, notifications } from "@/db/schema";
import { eq, and, or, desc, gt, like, sql, inArray } from "drizzle-orm";

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
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
}

async function notifyAdmins(
  jobId: number,
  jobTitle: string,
  posterName: string
) {
  try {
    const admins = await db.select().from(users).where(eq(users.role, "admin"));

    const notificationPromises = admins.map((admin) =>
      db.insert(notifications).values({
        userId: admin.id,
        type: "job",
        title: "New Job Awaiting Approval",
        message: `${posterName} has posted a new job: "${jobTitle}". Please review and approve.`,
        relatedId: jobId.toString(),
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("Error notifying admins:", error);
  }
}

async function notifyStudentsAboutNewJob(
  jobId: number,
  jobTitle: string,
  company: string,
  jobType: string
) {
  try {
    // Get all active students
    const students = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "student"),
          or(eq(users.status, "active"), eq(users.status, "approved"))
        )
      );

    // Create notifications for all students
    const notificationPromises = students.map((student) =>
      db.insert(notifications).values({
        userId: student.id,
        type: "job",
        title: "New Job Opportunity!",
        message: `${company} is hiring for ${jobTitle} (${jobType}). Check it out now!`,
        relatedId: jobId.toString(),
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("Error notifying students about new job:", error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Make authentication optional for GET requests
    const user = await getCurrentUser(request);

    const { searchParams } = new URL(request.url);
    const jobType = searchParams.get("type");
    const branch = searchParams.get("branch");
    const skillsParam = searchParams.get("skills");
    const postedBy = searchParams.get("postedBy");
    const statusParam = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const isAdmin = user?.role === "admin";
    const currentDate = new Date().toISOString();

    let conditions: any[] = [];

    if (isAdmin && statusParam) {
      conditions.push(eq(jobs.status, statusParam));
    } else {
      // Public users and non-admin users only see approved, non-expired jobs
      conditions.push(eq(jobs.status, "approved"));
      conditions.push(gt(jobs.expiresAt, currentDate));
    }

    if (jobType) {
      if (!["full-time", "internship", "part-time"].includes(jobType)) {
        return NextResponse.json(
          { error: "Invalid job type", code: "INVALID_JOB_TYPE" },
          { status: 400 }
        );
      }
      conditions.push(eq(jobs.jobType, jobType));
    }

    if (branch) {
      conditions.push(eq(jobs.branch, branch));
    }

    if (postedBy) {
      const postedByInt = parseInt(postedBy);
      if (isNaN(postedByInt)) {
        return NextResponse.json(
          { error: "Invalid postedBy user ID", code: "INVALID_POSTED_BY" },
          { status: 400 }
        );
      }
      conditions.push(eq(jobs.postedById, postedByInt));
    }

    let query = db
      .select({
        id: jobs.id,
        postedById: jobs.postedById,
        title: jobs.title,
        company: jobs.company,
        description: jobs.description,
        location: jobs.location,
        jobType: jobs.jobType,
        salary: jobs.salary,
        skills: jobs.skills,
        status: jobs.status,
        branch: jobs.branch,
        approvedBy: jobs.approvedBy,
        approvedAt: jobs.approvedAt,
        createdAt: jobs.createdAt,
        expiresAt: jobs.expiresAt,
        poster: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          profileImageUrl: users.profileImageUrl,
          headline: users.headline,
        },
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.postedById, users.id))
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    let results = await query;

    if (skillsParam) {
      const requestedSkills = skillsParam
        .split(",")
        .map((s) => s.trim().toLowerCase());
      results = results.filter((job) => {
        if (!job.skills) return false;
        const jobSkills = Array.isArray(job.skills)
          ? job.skills.map((s: string) => s.toLowerCase())
          : [];
        return requestedSkills.some((skill) => jobSkills.includes(skill));
      });
    }

    // Log activity only if user is authenticated
    if (user) {
      await db.insert(activityLog).values({
        userId: user.id,
        role: user.role,
        action: "view_jobs",
        metadata: JSON.stringify({
          filters: {
            jobType,
            branch,
            skills: skillsParam,
            postedBy,
            status: statusParam,
          },
          count: results.length,
        }),
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ jobs: results }, { status: 200 });
  } catch (error: any) {
    console.error("GET jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "alumni" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only alumni and admins can post jobs", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      company,
      description,
      location,
      jobType,
      expiresAt,
      salary,
      skills,
      branch,
    } = body;

    if (
      !title ||
      !company ||
      !description ||
      !location ||
      !jobType ||
      !expiresAt
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, company, description, location, jobType, expiresAt",
          code: "MISSING_REQUIRED_FIELDS",
        },
        { status: 400 }
      );
    }

    if (!["full-time", "internship", "part-time"].includes(jobType)) {
      return NextResponse.json(
        {
          error:
            "Invalid jobType. Must be one of: full-time, internship, part-time",
          code: "INVALID_JOB_TYPE",
        },
        { status: 400 }
      );
    }

    const expiresAtDate = new Date(expiresAt);
    const currentDate = new Date();
    if (isNaN(expiresAtDate.getTime()) || expiresAtDate <= currentDate) {
      return NextResponse.json(
        {
          error:
            "Invalid expiresAt. Must be a valid ISO timestamp in the future",
          code: "INVALID_EXPIRES_AT",
        },
        { status: 400 }
      );
    }

    const status = user.role === "admin" ? "approved" : "pending";

    const jobData: any = {
      postedById: user.id,
      title: title.trim(),
      company: company.trim(),
      description: description.trim(),
      location: location.trim(),
      jobType,
      expiresAt: expiresAtDate.toISOString(),
      status,
      createdAt: new Date().toISOString(),
    };

    if (salary) {
      jobData.salary = salary.trim();
    }

    if (skills) {
      if (!Array.isArray(skills)) {
        return NextResponse.json(
          { error: "Skills must be an array", code: "INVALID_SKILLS_FORMAT" },
          { status: 400 }
        );
      }
      jobData.skills = JSON.stringify(skills);
    }

    if (branch) {
      jobData.branch = branch.trim();
    }

    if (status === "approved") {
      jobData.approvedBy = user.id;
      jobData.approvedAt = new Date().toISOString();
    }

    const newJob = await db.insert(jobs).values(jobData).returning();

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: "create_job",
      metadata: JSON.stringify({ jobId: newJob[0].id, status }),
      timestamp: new Date().toISOString(),
    });

    if (status === "pending") {
      await notifyAdmins(newJob[0].id, title, user.name);
    } else if (status === "approved") {
      // Notify all students about new job
      await notifyStudentsAboutNewJob(newJob[0].id, title, company, jobType);
    }

    return NextResponse.json(newJob[0], { status: 201 });
  } catch (error: any) {
    console.error("POST jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

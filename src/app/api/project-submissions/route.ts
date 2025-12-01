import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectSubmissions, users, teams } from "@/db/schema";
import { eq, desc, and, or } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
      with: { userId: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.userId),
    });

    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Only students can submit projects" }, { status: 403 });
    }

    const body = await req.json();
    const { teamId, title, description, repositoryUrl, demoUrl, documentUrl, technologies } = body;

    if (!teamId || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date().toISOString();

    const [submission] = await db.insert(projectSubmissions).values({
      teamId,
      submittedBy: user.id,
      title,
      description,
      repositoryUrl: repositoryUrl || null,
      demoUrl: demoUrl || null,
      documentUrl: documentUrl || null,
      technologies: technologies ? JSON.stringify(technologies) : null,
      status: "pending",
      submittedAt: now,
      updatedAt: now,
    }).returning();

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error("Error creating project submission:", error);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
    });

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    let query;
    
    if (user.role === "student") {
      // Students see only their submissions
      query = db.select({
        id: projectSubmissions.id,
        teamId: projectSubmissions.teamId,
        title: projectSubmissions.title,
        description: projectSubmissions.description,
        repositoryUrl: projectSubmissions.repositoryUrl,
        demoUrl: projectSubmissions.demoUrl,
        documentUrl: projectSubmissions.documentUrl,
        technologies: projectSubmissions.technologies,
        status: projectSubmissions.status,
        reviewComments: projectSubmissions.reviewComments,
        grade: projectSubmissions.grade,
        submittedAt: projectSubmissions.submittedAt,
        updatedAt: projectSubmissions.updatedAt,
        reviewedAt: projectSubmissions.reviewedAt,
        teamName: teams.name,
        reviewerName: users.name,
      })
      .from(projectSubmissions)
      .leftJoin(teams, eq(projectSubmissions.teamId, teams.id))
      .leftJoin(users, eq(projectSubmissions.reviewedBy, users.id))
      .where(eq(projectSubmissions.submittedBy, user.id))
      .orderBy(desc(projectSubmissions.submittedAt));
    } else if (user.role === "faculty") {
      // Faculty see all submissions
      const submitter = db.$with("submitter").as(
        db.select().from(users)
      );
      
      query = db.select({
        id: projectSubmissions.id,
        teamId: projectSubmissions.teamId,
        title: projectSubmissions.title,
        description: projectSubmissions.description,
        repositoryUrl: projectSubmissions.repositoryUrl,
        demoUrl: projectSubmissions.demoUrl,
        documentUrl: projectSubmissions.documentUrl,
        technologies: projectSubmissions.technologies,
        status: projectSubmissions.status,
        reviewComments: projectSubmissions.reviewComments,
        grade: projectSubmissions.grade,
        submittedAt: projectSubmissions.submittedAt,
        updatedAt: projectSubmissions.updatedAt,
        reviewedAt: projectSubmissions.reviewedAt,
        teamName: teams.name,
        submittedBy: projectSubmissions.submittedBy,
        submitterName: users.name,
        submitterEmail: users.email,
        submitterBranch: users.branch,
      })
      .from(projectSubmissions)
      .leftJoin(teams, eq(projectSubmissions.teamId, teams.id))
      .leftJoin(users, eq(projectSubmissions.submittedBy, users.id))
      .orderBy(desc(projectSubmissions.submittedAt));
    } else {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let submissions = await query;

    // Apply status filter if provided
    if (statusFilter) {
      submissions = submissions.filter((s: any) => s.status === statusFilter);
    }

    // Parse technologies JSON
    submissions = submissions.map((s: any) => ({
      ...s,
      technologies: s.technologies ? JSON.parse(s.technologies as string) : [],
    }));

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching project submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

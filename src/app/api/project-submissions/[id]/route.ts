import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectSubmissions, users, teams } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const submissionId = parseInt(id);

    const result = await db
      .select({
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
      })
      .from(projectSubmissions)
      .leftJoin(teams, eq(projectSubmissions.teamId, teams.id))
      .leftJoin(users, eq(projectSubmissions.submittedBy, users.id))
      .where(eq(projectSubmissions.id, submissionId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const submission = {
      ...result[0],
      technologies: result[0].technologies
        ? JSON.parse(result[0].technologies as string)
        : [],
    };

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!user || user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can update submissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const submissionId = parseInt(id);

    const existing = await db.query.projectSubmissions.findFirst({
      where: (projectSubmissions, { eq }) =>
        eq(projectSubmissions.id, submissionId),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (existing.submittedBy !== user.id) {
      return NextResponse.json(
        { error: "You can only update your own submissions" },
        { status: 403 }
      );
    }

    if (
      existing.status !== "pending" &&
      existing.status !== "revision_requested"
    ) {
      return NextResponse.json(
        { error: "Cannot update submission with current status" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      repositoryUrl,
      demoUrl,
      documentUrl,
      technologies,
    } = body;

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (repositoryUrl !== undefined)
      updateData.repositoryUrl = repositoryUrl || null;
    if (demoUrl !== undefined) updateData.demoUrl = demoUrl || null;
    if (documentUrl !== undefined) updateData.documentUrl = documentUrl || null;
    if (technologies !== undefined)
      updateData.technologies = JSON.stringify(technologies);

    // Reset status to pending if it was revision_requested
    if (existing.status === "revision_requested") {
      updateData.status = "pending";
    }

    const [updated] = await db
      .update(projectSubmissions)
      .set(updateData)
      .where(eq(projectSubmissions.id, submissionId))
      .returning();

    return NextResponse.json({ submission: updated });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { referrals, users, jobs } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// Get user's referrals
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find session by token
    const { sessions } = await import("@/db/schema");
    const sessionResult = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const session = sessionResult[0];

    // Check if session is expired
    const isExpired = new Date(session.expiresAt) <= new Date();
    if (isExpired) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Get user by userId
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult[0];

    // Get user's referrals (without job information for now - until migration is done)
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.alumniId, user.id))
      .orderBy(desc(referrals.createdAt));

    return NextResponse.json({
      success: true,
      referrals: userReferrals,
    });
  } catch (error) {
    console.error("Get referrals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}

// Create new referral
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find session by token
    const { sessions } = await import("@/db/schema");
    const sessionResult = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const session = sessionResult[0];

    // Check if session is expired
    const isExpired = new Date(session.expiresAt) <= new Date();
    if (isExpired) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Get user by userId
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult[0];

    if (user.role !== "alumni") {
      return NextResponse.json(
        { error: "Only alumni can create referrals" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { jobId, company, position, description, maxUses, expiresAt } = body;

    if (!company || !position) {
      return NextResponse.json(
        { error: "Company and position are required" },
        { status: 400 }
      );
    }

    // Job validation temporarily disabled until migration is complete
    // TODO: Re-enable after adding job_id column to referrals table
    /*
    if (jobId) {
      const jobResult = await db
        .select()
        .from(jobs)
        .where(and(eq(jobs.id, jobId), eq(jobs.postedById, user.id)))
        .limit(1);

      if (jobResult.length === 0) {
        return NextResponse.json(
          {
            error:
              "Job not found or you don't have permission to create referrals for this job",
          },
          { status: 403 }
        );
      }
    }
    */

    // Generate unique referral code
    const companyCode = company
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 6);
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${companyCode}-${randomCode}`;

    // Create referral (without jobId for now - until migration is done)
    const [referral] = await db
      .insert(referrals)
      .values({
        alumniId: user.id,
        // jobId: jobId || null, // Commented out until migration
        code,
        company,
        position,
        description: description || null,
        maxUses: maxUses || 10,
        usedCount: 0,
        isActive: true,
        expiresAt: expiresAt || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      referral,
      message: "Referral created successfully!",
    });
  } catch (error) {
    console.error("Create referral error:", error);
    return NextResponse.json(
      { error: "Failed to create referral", details: (error as Error).message },
      { status: 500 }
    );
  }
}

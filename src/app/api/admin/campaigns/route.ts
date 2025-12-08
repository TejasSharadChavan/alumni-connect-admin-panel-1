import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, activityLog, users, sessions } from "@/db/schema";
import { eq, and, like, or, desc } from "drizzle-orm";

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
    console.error("Authentication error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query = db.select().from(campaigns);
    const conditions = [];

    if (status) {
      conditions.push(eq(campaigns.status, status));
    }
    if (category) {
      conditions.push(eq(campaigns.category, category));
    }
    if (search) {
      conditions.push(
        or(
          like(campaigns.title, `%${search}%`),
          like(campaigns.description, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const allCampaigns = await query.orderBy(desc(campaigns.createdAt));

    return NextResponse.json({
      campaigns: allCampaigns,
      total: allCampaigns.length,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      goalAmount,
      startDate,
      endDate,
      imageUrl,
    } = body;

    if (
      !title ||
      !description ||
      !category ||
      !goalAmount ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newCampaign] = await db
      .insert(campaigns)
      .values({
        creatorId: user.id,
        title,
        description,
        category,
        goalAmount: parseFloat(goalAmount),
        currentAmount: 0,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        imageUrl: imageUrl || null,
        status: "active",
        approvedBy: user.id,
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    // Log the action
    await db.insert(activityLog).values({
      userId: user.id,
      role: "admin",
      action: "create_campaign",
      metadata: JSON.stringify({ campaignId: newCampaign.id, title }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ campaign: newCampaign }, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

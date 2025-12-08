import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  campaigns,
  donations,
  activityLog,
  users,
  sessions,
} from "@/db/schema";
import { eq } from "drizzle-orm";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const campaignId = parseInt(id);

    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId));

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const campaignId = parseInt(id);
    const body = await request.json();

    const [existingCampaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId));

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.goalAmount !== undefined)
      updateData.goalAmount = parseFloat(body.goalAmount);
    if (body.startDate !== undefined)
      updateData.startDate = new Date(body.startDate).toISOString();
    if (body.endDate !== undefined)
      updateData.endDate = new Date(body.endDate).toISOString();
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.status !== undefined) updateData.status = body.status;

    const [updatedCampaign] = await db
      .update(campaigns)
      .set(updateData)
      .where(eq(campaigns.id, campaignId))
      .returning();

    // Log the action
    await db.insert(activityLog).values({
      userId: user.id,
      role: "admin",
      action: "update_campaign",
      metadata: JSON.stringify({
        campaignId,
        changes: Object.keys(updateData),
      }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ campaign: updatedCampaign });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const campaignId = parseInt(id);

    const [existingCampaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId));

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if campaign has donations
    const campaignDonations = await db
      .select()
      .from(donations)
      .where(eq(donations.campaignId, campaignId));

    if (campaignDonations.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete campaign with existing donations" },
        { status: 400 }
      );
    }

    // Delete campaign
    await db.delete(campaigns).where(eq(campaigns.id, campaignId));

    // Log the action
    await db.insert(activityLog).values({
      userId: user.id,
      role: "admin",
      action: "delete_campaign",
      metadata: JSON.stringify({
        campaignId,
        title: existingCampaign.title,
      }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}

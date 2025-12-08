import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { donations, users, sessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

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

    const campaignDonations = await db
      .select({
        id: donations.id,
        amount: donations.amount,
        message: donations.message,
        isAnonymous: donations.isAnonymous,
        createdAt: donations.createdAt,
        userId: donations.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(donations)
      .leftJoin(users, eq(donations.userId, users.id))
      .where(eq(donations.campaignId, campaignId))
      .orderBy(desc(donations.createdAt));

    const total = campaignDonations.reduce(
      (sum, d) => sum + parseFloat(d.amount.toString()),
      0
    );

    return NextResponse.json({
      donations: campaignDonations,
      total: campaignDonations.length,
      totalAmount: total,
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}

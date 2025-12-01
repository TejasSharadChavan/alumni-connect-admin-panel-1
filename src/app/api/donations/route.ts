import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { donations, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const sessionQuery = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
    });

    if (!sessionQuery) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, amount, message, isAnonymous } = body;

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least ₹100" },
        { status: 400 }
      );
    }

    const donation = await db.insert(donations).values({
      campaignId: campaignId ? parseInt(campaignId) : null,
      donorId: sessionQuery.userId,
      amount: parseInt(amount),
      message: message || null,
      isAnonymous: isAnonymous || false,
      paymentStatus: "completed",
      transactionId: `don_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json({
      success: true,
      donation: donation[0],
    });
  } catch (error) {
    console.error("Donation creation error:", error);
    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const sessionQuery = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
    });

    if (!sessionQuery) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let donationsList;
    if (userId) {
      donationsList = await db.query.donations.findMany({
        where: eq(donations.donorId, parseInt(userId)),
        orderBy: [desc(donations.createdAt)],
      });
    } else {
      donationsList = await db.query.donations.findMany({
        orderBy: [desc(donations.createdAt)],
      });
    }

    // Fetch donor information for each donation
    const donationsWithDonors = await Promise.all(
      donationsList.map(async (donation) => {
        const donor = await db.query.users.findFirst({
          where: eq(users.id, donation.donorId),
        });

        return {
          ...donation,
          donorName: donation.isAnonymous ? "Anonymous" : donor?.name || "Unknown",
          donorEmail: donation.isAnonymous ? null : donor?.email,
        };
      })
    );

    return NextResponse.json({
      donations: donationsWithDonors,
    });
  } catch (error) {
    console.error("Donations fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
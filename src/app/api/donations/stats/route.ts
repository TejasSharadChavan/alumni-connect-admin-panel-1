import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { donations, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

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

    // Get all donations
    const allDonations = await db.query.donations.findMany({
      where: eq(donations.paymentStatus, "completed"),
    });

    // Calculate total and count
    const totalDonations = allDonations.reduce((sum, d) => sum + d.amount, 0);
    const donationCount = allDonations.length;

    // Get recent donations (last 5)
    const recentDonationsList = await db.query.donations.findMany({
      where: eq(donations.paymentStatus, "completed"),
      orderBy: [desc(donations.createdAt)],
      limit: 5,
    });

    // Fetch donor information for recent donations
    const recentDonations = await Promise.all(
      recentDonationsList.map(async (donation) => {
        const donor = await db.query.users.findFirst({
          where: eq(users.id, donation.donorId),
        });

        return {
          ...donation,
          donorName: donation.isAnonymous ? "Anonymous" : donor?.name || "Unknown",
        };
      })
    );

    // Get user's personal donation stats
    const userDonations = allDonations.filter(d => d.donorId === sessionQuery.userId);
    const userTotalDonations = userDonations.reduce((sum, d) => sum + d.amount, 0);
    const userDonationCount = userDonations.length;

    return NextResponse.json({
      totalDonations,
      donationCount,
      recentDonations,
      userStats: {
        totalDonations: userTotalDonations,
        donationCount: userDonationCount,
      },
    });
  } catch (error) {
    console.error("Donation stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donation stats" },
      { status: 500 }
    );
  }
}
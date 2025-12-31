import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { donations, campaigns } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify session (similar to create-order)
    const { sessions, users } = await import("@/db/schema");
    const sessionResult = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const session = sessionResult[0];
    const isExpired = new Date(session.expiresAt) <= new Date();
    if (isExpired) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId,
    } = body;

    // In production, verify signature using Razorpay SDK
    // For demo, we'll simulate verification
    const isValid = true; // In production: verify signature with crypto

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update donation status
    const [updatedDonation] = await db
      .update(donations)
      .set({
        paymentStatus: "completed",
        transactionId: razorpay_payment_id,
      })
      .where(eq(donations.id, donationId))
      .returning();

    // Update campaign total if donation was for a campaign
    if (updatedDonation.campaignId) {
      await db
        .update(campaigns)
        .set({
          currentAmount: sql`${campaigns.currentAmount} + ${updatedDonation.amount}`,
        })
        .where(eq(campaigns.id, updatedDonation.campaignId));
    }

    return NextResponse.json({
      success: true,
      donation: updatedDonation,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

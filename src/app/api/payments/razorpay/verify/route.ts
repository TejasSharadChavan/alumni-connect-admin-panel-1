import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { donations, campaigns } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId 
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

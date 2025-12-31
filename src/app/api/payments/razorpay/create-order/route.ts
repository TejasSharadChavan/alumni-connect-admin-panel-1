import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { donations, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
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

    const body = await req.json();
    const { campaignId, amount, message } = body;

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // In production, use actual Razorpay SDK
    // For now, simulate order creation
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create donation record with pending status
    const [donation] = await db
      .insert(donations)
      .values({
        campaignId: campaignId || null,
        donorId: user.id,
        amount,
        message: message || null,
        paymentStatus: "pending",
        transactionId: orderId,
      })
      .returning();

    // Simulate Razorpay order response
    const razorpayOrder = {
      id: orderId,
      amount: amount * 100, // Razorpay uses paise
      currency: "INR",
      receipt: `receipt_${donation.id}`,
    };

    return NextResponse.json({
      order: razorpayOrder,
      donationId: donation.id,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_demo",
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

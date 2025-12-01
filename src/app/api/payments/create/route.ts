import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments } from "@/db/schema";

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
    const { amount, type, relatedId, cardNumber, testMode } = body;

    if (!amount || !type) {
      return NextResponse.json(
        { error: "Amount and type are required" },
        { status: 400 }
      );
    }

    // In test mode, validate test card
    if (testMode && cardNumber !== "4242424242424242") {
      return NextResponse.json(
        { error: "Invalid test card. Use 4242 4242 4242 4242" },
        { status: 400 }
      );
    }

    // Create payment record
    const transactionId = `txn_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const payment = await db.insert(payments).values({
      userId: sessionQuery.userId,
      relatedType: type,
      relatedId: relatedId || "",
      amount,
      currency: "INR",
      status: "completed",
      gateway: "stripe_test",
      transactionId,
      createdAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json({
      success: true,
      payment: payment[0],
      transactionId,
      message: "Payment processed successfully (Test Mode)",
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}

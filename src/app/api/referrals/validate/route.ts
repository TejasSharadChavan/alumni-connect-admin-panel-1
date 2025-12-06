import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { referrals } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Referral code is required" },
        { status: 400 }
      );
    }

    // Find referral by code
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.code, code.toUpperCase()))
      .limit(1);

    if (!referral) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: "Invalid referral code",
      });
    }

    // Check if active
    if (!referral.isActive) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: "This referral code is no longer active",
      });
    }

    // Check if expired
    if (referral.expiresAt && new Date(referral.expiresAt) < new Date()) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: "This referral code has expired",
      });
    }

    // Check usage limit
    if (referral.usedCount >= (referral.maxUses || 10)) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: "This referral code has reached its usage limit",
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      referral: {
        id: referral.id,
        code: referral.code,
        company: referral.company,
        position: referral.position,
        description: referral.description,
      },
    });
  } catch (error) {
    console.error("Validate referral error:", error);
    return NextResponse.json(
      { success: false, error: "Validation failed" },
      { status: 500 }
    );
  }
}

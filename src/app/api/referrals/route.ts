import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { referrals, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// Get user's referrals
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from token
    const [session] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(token)))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get user's referrals
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.alumniId, session.id))
      .orderBy(desc(referrals.createdAt));

    return NextResponse.json({
      success: true,
      referrals: userReferrals,
    });
  } catch (error) {
    console.error("Get referrals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}

// Create new referral
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from token
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(token)))
      .limit(1);

    if (!user || user.role !== "alumni") {
      return NextResponse.json(
        { error: "Only alumni can create referrals" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { company, position, description, maxUses, expiresAt } = body;

    if (!company || !position) {
      return NextResponse.json(
        { error: "Company and position are required" },
        { status: 400 }
      );
    }

    // Generate unique referral code
    const companyCode = company
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 6);
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${companyCode}-${randomCode}`;

    // Create referral
    const [referral] = await db
      .insert(referrals)
      .values({
        alumniId: user.id,
        code,
        company,
        position,
        description: description || null,
        maxUses: maxUses || 10,
        usedCount: 0,
        isActive: true,
        expiresAt: expiresAt || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      referral,
      message: "Referral created successfully!",
    });
  } catch (error) {
    console.error("Create referral error:", error);
    return NextResponse.json(
      { error: "Failed to create referral", details: (error as Error).message },
      { status: 500 }
    );
  }
}

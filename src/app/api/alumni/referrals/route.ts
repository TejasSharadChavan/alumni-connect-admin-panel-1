import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { referrals, sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) return null;

    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET - Fetch alumni's referrals
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "alumni") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { desc } = await import("drizzle-orm");

    const alumniReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.alumniId, user.id))
      .orderBy(desc(referrals.createdAt));

    return NextResponse.json({
      success: true,
      referrals: alumniReferrals,
    });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}

// POST - Create a new referral
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "alumni") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      studentId,
      company,
      position,
      description,
      maxUses,
      expiresInDays,
    } = body;

    if (!studentId || !company || !position) {
      return NextResponse.json(
        { error: "Missing required fields: studentId, company, position" },
        { status: 400 }
      );
    }

    // Verify student exists
    const [student] = await db
      .select()
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);

    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Generate unique referral code
    let code = generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await db
        .select()
        .from(referrals)
        .where(eq(referrals.code, code))
        .limit(1);

      if (existing.length === 0) break;
      code = generateReferralCode();
      attempts++;
    }

    // Calculate expiry date
    let expiresAt = null;
    if (expiresInDays) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + expiresInDays);
      expiresAt = expiry.toISOString();
    }

    // Create referral
    const [newReferral] = await db
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
        expiresAt,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      referral: newReferral,
      message: "Referral created successfully",
    });
  } catch (error) {
    console.error("Error creating referral:", error);
    return NextResponse.json(
      { error: "Failed to create referral" },
      { status: 500 }
    );
  }
}

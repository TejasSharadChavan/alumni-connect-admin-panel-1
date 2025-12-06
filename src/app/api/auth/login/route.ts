import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  console.log("🔐 Login API called");

  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("📧 Login attempt for:", email);

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (userResults.length === 0) {
      console.log("❌ User not found");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = userResults[0];
    console.log("✅ User found:", user.name, "Status:", user.status);

    // Check status
    if (user.status !== "active" && user.status !== "approved") {
      console.log("❌ User not active/approved");
      return NextResponse.json(
        { error: `Account not active. Status: ${user.status}` },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      console.log("❌ Password mismatch");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("✅ Password verified");

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const createdAt = new Date().toISOString();

    // Create session
    await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt,
      createdAt,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    console.log("✅ Session created, returning success");

    // Return success
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      {
        error:
          "Login failed: " +
          (error instanceof Error ? error.message : "Unknown"),
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const VALID_ROLES = ["student", "alumni", "faculty", "admin"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      branch,
      cohort,
      yearOfPassing,
      department,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Role must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user directly (bypassing approval)
    const newUser = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
        branch: branch || null,
        cohort: cohort || null,
        yearOfPassing: yearOfPassing ? parseInt(yearOfPassing) : null,
        department: department || null,
        profileImageUrl: null,
        bio: null,
        headline: null,
        location: null,
        phone: null,
        linkedin: null,
        github: null,
        website: null,
        skills: null,
        interests: null,
        achievements: null,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    // Create session token
    const token = `${newUser[0].id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(sessions).values({
      userId: newUser[0].id,
      token,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });

    // Return user and token
    const { passwordHash: _, ...userWithoutPassword } = newUser[0];

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Quick register error:", error);
    return NextResponse.json(
      { error: "Failed to create user: " + (error as Error).message },
      { status: 500 }
    );
  }
}

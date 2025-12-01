import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pendingUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const VALID_ROLES = ['student', 'alumni', 'faculty'] as const;
type ValidRole = typeof VALID_ROLES[number];

interface SubmittedData {
  branch?: string;
  cohort?: string;
  yearOfPassing?: number;
  department?: string;
  phone?: string;
}

interface RequestBody {
  name: string;
  email: string;
  password: string;
  requestedRole: string;
  submittedData?: SubmittedData;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidRole(role: string): role is ValidRole {
  return VALID_ROLES.includes(role as ValidRole);
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { name, email, password, requestedRole, submittedData = {} } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { 
          error: "Name is required and cannot be empty",
          code: "VALIDATION_ERROR" 
        },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { 
          error: "Valid email address is required",
          code: "VALIDATION_ERROR" 
        },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { 
          error: "Password must be at least 8 characters long",
          code: "VALIDATION_ERROR" 
        },
        { status: 400 }
      );
    }

    if (!requestedRole || !isValidRole(requestedRole)) {
      return NextResponse.json(
        { 
          error: "RequestedRole must be one of: 'student', 'alumni', 'faculty'",
          code: "VALIDATION_ERROR" 
        },
        { status: 400 }
      );
    }

    // Role-specific validation
    if (requestedRole === 'student') {
      if (!submittedData.branch || submittedData.branch.trim().length === 0) {
        return NextResponse.json(
          { 
            error: "Branch is required for student registration",
            code: "VALIDATION_ERROR" 
          },
          { status: 400 }
        );
      }
      if (!submittedData.cohort || submittedData.cohort.trim().length === 0) {
        return NextResponse.json(
          { 
            error: "Cohort is required for student registration",
            code: "VALIDATION_ERROR" 
          },
          { status: 400 }
        );
      }
    }

    if (requestedRole === 'alumni') {
      if (!submittedData.branch || submittedData.branch.trim().length === 0) {
        return NextResponse.json(
          { 
            error: "Branch is required for alumni registration",
            code: "VALIDATION_ERROR" 
          },
          { status: 400 }
        );
      }
      if (!submittedData.yearOfPassing) {
        return NextResponse.json(
          { 
            error: "Year of passing is required for alumni registration",
            code: "VALIDATION_ERROR" 
          },
          { status: 400 }
        );
      }
    }

    if (requestedRole === 'faculty') {
      if (!submittedData.department || submittedData.department.trim().length === 0) {
        return NextResponse.json(
          { 
            error: "Department is required for faculty registration",
            code: "VALIDATION_ERROR" 
          },
          { status: 400 }
        );
      }
    }

    // Check if email already exists in pendingUsers
    const normalizedEmail = email.toLowerCase().trim();
    const existingPendingUser = await db
      .select()
      .from(pendingUsers)
      .where(eq(pendingUsers.email, normalizedEmail))
      .limit(1);

    if (existingPendingUser.length > 0) {
      return NextResponse.json(
        { 
          error: "Email already registered",
          code: "EMAIL_EXISTS" 
        },
        { status: 409 }
      );
    }

    // Hash password
    let passwordHash: string;
    try {
      passwordHash = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      return NextResponse.json(
        { 
          error: "Failed to process password",
          code: "SERVER_ERROR" 
        },
        { status: 500 }
      );
    }

    // Create pending user
    const submittedAt = new Date().toISOString();
    const newPendingUser = await db
      .insert(pendingUsers)
      .values({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        requestedRole,
        submittedData: submittedData as any,
        status: 'pending',
        submittedAt,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Registration submitted. Awaiting admin approval.",
        id: newPendingUser[0].id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/auth/register error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: "SERVER_ERROR" 
      },
      { status: 500 }
    );
  }
}
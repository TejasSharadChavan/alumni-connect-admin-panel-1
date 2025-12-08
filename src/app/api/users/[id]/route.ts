import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Helper function to validate session
async function validateSession(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessionResult = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return null;
    }

    const session = sessionResult[0];
    const expiresAt = new Date(session.expiresAt);

    if (expiresAt < new Date()) {
      return null;
    }

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userResult.length === 0) {
      return null;
    }

    return userResult[0];
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

// Helper function to exclude passwordHash from user object
function sanitizeUser(user: any, includeAllFields: boolean = false) {
  const { passwordHash, ...sanitizedUser } = user;

  if (includeAllFields) {
    return sanitizedUser;
  }

  // Return limited fields for public view
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    branch: user.branch,
    cohort: user.cohort,
    yearOfPassing: user.yearOfPassing,
    department: user.department,
    headline: user.headline,
    bio: user.bio,
    skills: user.skills,
    profileImageUrl: user.profileImageUrl,
    linkedinUrl: user.linkedinUrl,
    githubUrl: user.githubUrl,
  };
}

// Helper function to validate URL format
function isValidUrl(urlString: string): boolean {
  // Allow base64 data URLs for images
  if (urlString.startsWith("data:image/")) {
    return true;
  }

  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract id from params
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Valid user ID is required", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // Find user by id
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "User not found or not active", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // Check if user status is active or approved
    if (user.status !== "active" && user.status !== "approved") {
      return NextResponse.json(
        { error: "User not found or not active", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Check authentication (optional for public profiles)
    const authenticatedUser = await validateSession(request);

    // Determine if user should see all fields
    const includeAllFields =
      authenticatedUser &&
      (authenticatedUser.id === userId || authenticatedUser.role === "admin");

    const sanitizedUser = sanitizeUser(user, includeAllFields);

    return NextResponse.json({ user: sanitizedUser }, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      {
        error: "Internal server error: " + (error as Error).message,
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract id from params
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Valid user ID is required", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // Validate authentication
    const authenticatedUser = await validateSession(request);

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // Check authorization: own profile or admin
    const isOwnProfile = authenticatedUser.id === userId;
    const isAdmin = authenticatedUser.role === "admin";

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json(
        {
          error: "Forbidden. Cannot update another user's profile.",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();

    // Find user by id
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "User not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Prepare update object
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Regular user updatable fields
    const regularUserFields = [
      "name",
      "headline",
      "bio",
      "skills",
      "profileImageUrl",
      "resumeUrl",
      "linkedinUrl",
      "githubUrl",
      "phone",
      "department", // Allow users to update their own department
    ];

    // Admin-only updatable fields
    const adminOnlyFields = [
      "role",
      "status",
      "branch",
      "cohort",
      "yearOfPassing",
      "email",
    ];

    // Process regular user fields
    for (const field of regularUserFields) {
      if (field in body) {
        // Validate skills is an array
        if (field === "skills") {
          if (!Array.isArray(body[field])) {
            return NextResponse.json(
              { error: "Skills must be an array", code: "VALIDATION_ERROR" },
              { status: 400 }
            );
          }
          updates[field] = JSON.stringify(body[field]);
        }
        // Validate URLs
        else if (field.includes("Url") || field.includes("url")) {
          if (body[field] && !isValidUrl(body[field])) {
            return NextResponse.json(
              {
                error: `Invalid URL format for ${field}`,
                code: "VALIDATION_ERROR",
              },
              { status: 400 }
            );
          }
          updates[field] = body[field];
        }
        // Other fields
        else {
          updates[field] = body[field];
        }
      }
    }

    // Process admin-only fields
    if (isAdmin) {
      for (const field of adminOnlyFields) {
        if (field in body) {
          // Validate email uniqueness if being updated
          if (field === "email") {
            const existingUserResult = await db
              .select()
              .from(users)
              .where(and(eq(users.email, body[field]), eq(users.id, userId)))
              .limit(1);

            const otherUserWithEmail = await db
              .select()
              .from(users)
              .where(eq(users.email, body[field]))
              .limit(1);

            if (
              otherUserWithEmail.length > 0 &&
              otherUserWithEmail[0].id !== userId
            ) {
              return NextResponse.json(
                {
                  error: "Email already in use by another user",
                  code: "VALIDATION_ERROR",
                },
                { status: 400 }
              );
            }
          }

          updates[field] = body[field];
        }
      }
    } else {
      // Check if non-admin is trying to update admin-only fields
      for (const field of adminOnlyFields) {
        if (field in body) {
          return NextResponse.json(
            {
              error: `Permission denied. Cannot update field: ${field}`,
              code: "FORBIDDEN",
            },
            { status: 403 }
          );
        }
      }
    }

    // Check if there are any updates besides updatedAt
    if (Object.keys(updates).length === 1) {
      return NextResponse.json(
        { error: "No valid fields to update", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Update user record
    const updatedUserResult = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    if (updatedUserResult.length === 0) {
      return NextResponse.json(
        { error: "Failed to update user", code: "SERVER_ERROR" },
        { status: 500 }
      );
    }

    const updatedUser = updatedUserResult[0];
    const sanitizedUser = sanitizeUser(updatedUser, true);

    return NextResponse.json(
      { message: "Profile updated successfully", user: sanitizedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      {
        error: "Internal server error: " + (error as Error).message,
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Middleware to verify admin access
 * Returns the authenticated admin user or throws an error response
 */
export async function requireAdmin(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  return session.user;
}

/**
 * Check if user is admin without throwing
 */
export async function isAdmin(request: NextRequest): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "admin";
}

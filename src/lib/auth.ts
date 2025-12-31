import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const [session] = await db
      .select({
        userId: sessions.userId,
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
        },
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function requireAuth(token: string): Promise<AuthUser> {
  const user = await verifyToken(token);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin(token: string): Promise<AuthUser> {
  const user = await requireAuth(token);
  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return user;
}

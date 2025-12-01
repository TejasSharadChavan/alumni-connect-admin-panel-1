import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, connections, sessions, activityLog } from '@/db/schema';
import { eq, and, or, notInArray, ne, sql } from 'drizzle-orm';

async function getUserFromToken(request: NextRequest): Promise<{ id: number; email: string; name: string } | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    const session = await db.select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0) {
      return null;
    }

    const sessionData = session[0];
    const expiresAt = new Date(sessionData.expiresAt);
    if (expiresAt < new Date()) {
      return null;
    }

    const user = await db.select({
      id: users.id,
      email: users.email,
      name: users.name
    })
      .from(users)
      .where(eq(users.id, sessionData.userId))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);

    // Get current user's details
    const currentUser = await db.select({
      id: users.id,
      branch: users.branch,
      cohort: users.cohort,
      department: users.department,
      role: users.role
    })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    const currentUserData = currentUser[0];

    // Get all user IDs that are already connected (any status)
    const existingConnections = await db.select({
      userId: sql<number>`CASE 
        WHEN ${connections.requesterId} = ${user.id} THEN ${connections.responderId}
        WHEN ${connections.responderId} = ${user.id} THEN ${connections.requesterId}
      END`.as('userId')
    })
      .from(connections)
      .where(
        or(
          eq(connections.requesterId, user.id),
          eq(connections.responderId, user.id)
        )
      );

    const connectedUserIds = existingConnections
      .map(c => c.userId)
      .filter((id): id is number => id !== null);

    // Build the query for suggestions
    let whereConditions = [
      ne(users.id, user.id),
      eq(users.status, 'active')
    ];

    // Exclude already connected users
    if (connectedUserIds.length > 0) {
      whereConditions.push(notInArray(users.id, connectedUserIds));
    }

    // Add matching criteria (same branch OR cohort OR department)
    const matchingCriteria = [];
    if (currentUserData.branch) {
      matchingCriteria.push(eq(users.branch, currentUserData.branch));
    }
    if (currentUserData.cohort) {
      matchingCriteria.push(eq(users.cohort, currentUserData.cohort));
    }
    if (currentUserData.department) {
      matchingCriteria.push(eq(users.department, currentUserData.department));
    }

    if (matchingCriteria.length > 0) {
      whereConditions.push(or(...matchingCriteria));
    } else {
      // If no matching criteria, return empty suggestions
      await db.insert(activityLog).values({
        userId: user.id,
        role: currentUserData.role ?? 'student',
        action: 'view_connection_suggestions',
        metadata: JSON.stringify({ count: 0 }),
        timestamp: new Date().toISOString()
      });

      return NextResponse.json([]);
    }

    // Get suggestions
    const suggestions = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      branch: users.branch,
      cohort: users.cohort,
      department: users.department,
      headline: users.headline,
      profileImageUrl: users.profileImageUrl
    })
      .from(users)
      .where(and(...whereConditions))
      .limit(limit);

    // Add match reason and prioritize results
    const suggestionsWithReason = suggestions.map(suggestion => {
      const matchReasons = [];
      let priority = 0;

      if (suggestion.branch === currentUserData.branch) {
        matchReasons.push('Same branch');
        priority += 3;
      }
      if (suggestion.role === currentUserData.role) {
        priority += 2;
      }
      if (suggestion.cohort === currentUserData.cohort) {
        matchReasons.push('Same cohort');
        priority += 1;
      }
      if (suggestion.department === currentUserData.department) {
        matchReasons.push('Same department');
        priority += 1;
      }

      return {
        ...suggestion,
        matchReason: matchReasons.join(', '),
        priority
      };
    });

    // Sort by priority (branch match first, then role match)
    suggestionsWithReason.sort((a, b) => b.priority - a.priority);

    // Remove priority field before returning
    const finalSuggestions = suggestionsWithReason.map(({ priority, ...rest }) => rest);

    // Log activity
    await db.insert(activityLog).values({
      userId: user.id,
      role: currentUserData.role ?? 'student',
      action: 'view_connection_suggestions',
      metadata: JSON.stringify({ count: finalSuggestions.length }),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(finalSuggestions);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
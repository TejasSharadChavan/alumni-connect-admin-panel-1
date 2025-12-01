import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { connections, sessions, users, activityLog, notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function getAuthenticatedUser(request: NextRequest) {
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

  const user = await db.select()
    .from(users)
    .where(eq(users.id, sessionData.userId))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const connectionId = request.nextUrl.pathname.split('/')[3];
    
    if (!connectionId || isNaN(parseInt(connectionId))) {
      return NextResponse.json({ 
        error: 'Valid connection ID is required',
        code: 'INVALID_CONNECTION_ID' 
      }, { status: 400 });
    }

    const connection = await db.select()
      .from(connections)
      .where(eq(connections.id, parseInt(connectionId)))
      .limit(1);

    if (connection.length === 0) {
      return NextResponse.json({ 
        error: 'Connection request not found',
        code: 'CONNECTION_NOT_FOUND' 
      }, { status: 404 });
    }

    const connectionData = connection[0];

    if (connectionData.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Connection request has already been processed',
        code: 'CONNECTION_ALREADY_PROCESSED' 
      }, { status: 400 });
    }

    if (connectionData.responderId !== user.id) {
      return NextResponse.json({ 
        error: 'You are not authorized to reject this connection request',
        code: 'NOT_RESPONDER' 
      }, { status: 403 });
    }

    const updated = await db.update(connections)
      .set({
        status: 'rejected',
        respondedAt: new Date().toISOString()
      })
      .where(eq(connections.id, parseInt(connectionId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to reject connection request',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: 'reject_connection',
      metadata: {
        connectionId: parseInt(connectionId),
        requesterId: connectionData.requesterId
      },
      timestamp: new Date().toISOString()
    });

    await db.insert(notifications).values({
      userId: connectionData.requesterId,
      type: 'connection',
      title: 'Connection Request Rejected',
      message: `${user.name} has rejected your connection request`,
      relatedId: connectionId,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
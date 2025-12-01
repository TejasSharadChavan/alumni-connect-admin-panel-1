import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts, jobs, events, campaigns, users, sessions, activityLog } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    const sessionResult = await db.select({
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
    })
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return null;
    }

    const session = sessionResult[0];
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    if (expiresAt < now) {
      return null;
    }

    const userResult = await db.select({
      id: users.id,
      role: users.role,
      name: users.name,
      email: users.email,
    })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userResult.length === 0) {
      return null;
    }

    return userResult[0];
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Access denied. Admin privileges required.',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let pendingPosts: any[] = [];
    let pendingJobs: any[] = [];
    let pendingEvents: any[] = [];
    let pendingCampaigns: any[] = [];

    if (!type || type === 'posts') {
      pendingPosts = await db.select({
        id: posts.id,
        authorId: posts.authorId,
        content: posts.content,
        imageUrl: posts.imageUrl,
        category: posts.category,
        branch: posts.branch,
        visibility: posts.visibility,
        status: posts.status,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        authorName: users.name,
        authorEmail: users.email,
        authorRole: users.role,
        authorProfileImageUrl: users.profileImageUrl,
      })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.status, 'pending'))
        .orderBy(desc(posts.createdAt));
    }

    if (!type || type === 'jobs') {
      pendingJobs = await db.select({
        id: jobs.id,
        postedById: jobs.postedById,
        title: jobs.title,
        company: jobs.company,
        description: jobs.description,
        location: jobs.location,
        jobType: jobs.jobType,
        salary: jobs.salary,
        skills: jobs.skills,
        status: jobs.status,
        branch: jobs.branch,
        createdAt: jobs.createdAt,
        expiresAt: jobs.expiresAt,
        posterName: users.name,
        posterEmail: users.email,
        posterRole: users.role,
        posterProfileImageUrl: users.profileImageUrl,
      })
        .from(jobs)
        .leftJoin(users, eq(jobs.postedById, users.id))
        .where(eq(jobs.status, 'pending'))
        .orderBy(desc(jobs.createdAt));
    }

    if (!type || type === 'events') {
      pendingEvents = await db.select({
        id: events.id,
        organizerId: events.organizerId,
        title: events.title,
        description: events.description,
        location: events.location,
        startDate: events.startDate,
        endDate: events.endDate,
        category: events.category,
        maxAttendees: events.maxAttendees,
        isPaid: events.isPaid,
        price: events.price,
        imageUrl: events.imageUrl,
        status: events.status,
        branch: events.branch,
        createdAt: events.createdAt,
        organizerName: users.name,
        organizerEmail: users.email,
        organizerRole: users.role,
        organizerProfileImageUrl: users.profileImageUrl,
      })
        .from(events)
        .leftJoin(users, eq(events.organizerId, users.id))
        .where(eq(events.status, 'pending'))
        .orderBy(desc(events.createdAt));
    }

    if (!type || type === 'campaigns') {
      pendingCampaigns = await db.select({
        id: campaigns.id,
        creatorId: campaigns.creatorId,
        title: campaigns.title,
        description: campaigns.description,
        goalAmount: campaigns.goalAmount,
        currentAmount: campaigns.currentAmount,
        category: campaigns.category,
        imageUrl: campaigns.imageUrl,
        status: campaigns.status,
        startDate: campaigns.startDate,
        endDate: campaigns.endDate,
        createdAt: campaigns.createdAt,
        creatorName: users.name,
        creatorEmail: users.email,
        creatorRole: users.role,
        creatorProfileImageUrl: users.profileImageUrl,
      })
        .from(campaigns)
        .leftJoin(users, eq(campaigns.creatorId, users.id))
        .where(eq(campaigns.status, 'pending'))
        .orderBy(desc(campaigns.createdAt));
    }

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: 'view_pending_content',
      metadata: JSON.stringify({
        filterType: type || 'all',
        postsCount: pendingPosts.length,
        jobsCount: pendingJobs.length,
        eventsCount: pendingEvents.length,
        campaignsCount: pendingCampaigns.length,
      }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      posts: pendingPosts,
      jobs: pendingJobs,
      events: pendingEvents,
      campaigns: pendingCampaigns,
    }, { status: 200 });

  } catch (error) {
    console.error('GET pending content error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
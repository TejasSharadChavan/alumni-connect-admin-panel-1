import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { applications, jobs, users, sessions, activityLog, notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const ALLOWED_STATUSES = ['applied', 'screening', 'interview', 'rejected', 'accepted'];

async function getCurrentUser(request: NextRequest) {
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

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const applicationId = request.nextUrl.pathname.split('/').pop();
    
    if (!applicationId || isNaN(parseInt(applicationId))) {
      return NextResponse.json({ 
        error: 'Valid application ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ 
        error: 'Status is required',
        code: 'MISSING_STATUS' 
      }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`,
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    const application = await db.select({
      id: applications.id,
      jobId: applications.jobId,
      applicantId: applications.applicantId,
      status: applications.status,
      postedById: jobs.postedById,
      jobTitle: jobs.title,
      applicantName: users.name,
      applicantEmail: users.email
    })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(users, eq(applications.applicantId, users.id))
      .where(eq(applications.id, parseInt(applicationId)))
      .limit(1);

    if (application.length === 0) {
      return NextResponse.json({ 
        error: 'Application not found',
        code: 'APPLICATION_NOT_FOUND' 
      }, { status: 404 });
    }

    const applicationData = application[0];

    const isJobPoster = applicationData.postedById === user.id;
    const isAdmin = user.role === 'admin';

    if (!isJobPoster && !isAdmin) {
      return NextResponse.json({ 
        error: 'You do not have permission to update this application. Only the job poster or admin can update application status.',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const updatedApplication = await db.update(applications)
      .set({
        status,
        updatedAt: new Date().toISOString()
      })
      .where(eq(applications.id, parseInt(applicationId)))
      .returning();

    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: 'update_application_status',
      metadata: JSON.stringify({
        applicationId: parseInt(applicationId),
        newStatus: status,
        previousStatus: applicationData.status,
        jobId: applicationData.jobId
      }),
      timestamp: new Date().toISOString()
    });

    await db.insert(notifications).values({
      userId: applicationData.applicantId,
      type: 'job',
      title: 'Application Status Updated',
      message: `Your application for "${applicationData.jobTitle}" has been updated to: ${status}`,
      relatedId: applicationId,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(updatedApplication[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
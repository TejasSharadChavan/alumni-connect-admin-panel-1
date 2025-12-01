import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { applications, jobs, users, sessions, activityLog, notifications } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const session = await db.select()
    .from(sessions)
    .where(and(
      eq(sessions.token, token),
      gt(sessions.expiresAt, new Date().toISOString())
    ))
    .limit(1);

  if (session.length === 0) {
    return null;
  }

  const user = await db.select()
    .from(users)
    .where(eq(users.id, session[0].userId))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    // Extract job ID from URL path
    const pathParts = request.nextUrl.pathname.split('/');
    const jobIdStr = pathParts[3];

    if (!jobIdStr || isNaN(parseInt(jobIdStr))) {
      return NextResponse.json({ 
        error: 'Valid job ID is required',
        code: 'INVALID_JOB_ID' 
      }, { status: 400 });
    }

    const jobId = parseInt(jobIdStr);

    // Validate user is a student
    if (user.role !== 'student') {
      return NextResponse.json({ 
        error: 'Only students can apply to jobs',
        code: 'NOT_STUDENT' 
      }, { status: 403 });
    }

    // Parse request body for optional fields
    const body = await request.json();
    const { resumeUrl, coverLetter } = body;

    // Security check: reject if applicantId provided in body
    if ('applicantId' in body || 'applicant_id' in body) {
      return NextResponse.json({ 
        error: 'Applicant ID cannot be provided in request body',
        code: 'APPLICANT_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    // Validate job exists
    const job = await db.select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (job.length === 0) {
      return NextResponse.json({ 
        error: 'Job not found',
        code: 'JOB_NOT_FOUND' 
      }, { status: 404 });
    }

    const jobData = job[0];

    // Validate job is approved
    if (jobData.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Job is not approved',
        code: 'JOB_NOT_APPROVED' 
      }, { status: 400 });
    }

    // Validate job is not expired
    const currentDate = new Date().toISOString();
    if (jobData.expiresAt <= currentDate) {
      return NextResponse.json({ 
        error: 'Job posting has expired',
        code: 'JOB_EXPIRED' 
      }, { status: 400 });
    }

    // Check if user has already applied to this job
    const existingApplication = await db.select()
      .from(applications)
      .where(and(
        eq(applications.jobId, jobId),
        eq(applications.applicantId, user.id)
      ))
      .limit(1);

    if (existingApplication.length > 0) {
      return NextResponse.json({ 
        error: 'You have already applied to this job',
        code: 'ALREADY_APPLIED' 
      }, { status: 400 });
    }

    // Create application
    const timestamp = new Date().toISOString();
    const newApplication = await db.insert(applications)
      .values({
        jobId,
        applicantId: user.id,
        resumeUrl: resumeUrl || null,
        coverLetter: coverLetter || null,
        status: 'applied',
        appliedAt: timestamp,
        updatedAt: timestamp
      })
      .returning();

    // Log activity
    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: 'apply_to_job',
      metadata: JSON.stringify({
        jobId,
        applicationId: newApplication[0].id
      }),
      timestamp
    });

    // Create notification for job poster
    await db.insert(notifications).values({
      userId: jobData.postedById,
      type: 'job',
      title: 'New Job Application',
      message: `${user.name} has applied to your job posting: ${jobData.title}`,
      relatedId: newApplication[0].id.toString(),
      isRead: false,
      createdAt: timestamp
    });

    return NextResponse.json(newApplication[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
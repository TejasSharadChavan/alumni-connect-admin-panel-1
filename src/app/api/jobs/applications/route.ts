import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { applications, jobs, users, sessions, activityLog } from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
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

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let applicationsQuery;
    let jobIds: number[] = [];

    // Role-based logic for filtering applications
    if (user.role === 'admin') {
      // Admin can see all applications
      applicationsQuery = db.select({
        id: applications.id,
        jobId: applications.jobId,
        applicantId: applications.applicantId,
        resumeUrl: applications.resumeUrl,
        coverLetter: applications.coverLetter,
        status: applications.status,
        appliedAt: applications.appliedAt,
        updatedAt: applications.updatedAt,
        job: {
          id: jobs.id,
          title: jobs.title,
          company: jobs.company,
          location: jobs.location,
          jobType: jobs.jobType,
        },
        applicant: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          branch: users.branch,
          resumeUrl: users.resumeUrl,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(users, eq(applications.applicantId, users.id));

    } else if (user.role === 'alumni') {
      // Alumni can see applications to their posted jobs
      const userJobs = await db.select({ id: jobs.id })
        .from(jobs)
        .where(eq(jobs.postedById, user.id));

      jobIds = userJobs.map(job => job.id);

      if (jobIds.length === 0) {
        // No jobs posted by this alumni
        await db.insert(activityLog).values({
          userId: user.id,
          role: user.role,
          action: 'view_applications',
          metadata: JSON.stringify({ 
            resultCount: 0,
            filters: { status, jobId }
          }),
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json([]);
      }

      applicationsQuery = db.select({
        id: applications.id,
        jobId: applications.jobId,
        applicantId: applications.applicantId,
        resumeUrl: applications.resumeUrl,
        coverLetter: applications.coverLetter,
        status: applications.status,
        appliedAt: applications.appliedAt,
        updatedAt: applications.updatedAt,
        job: {
          id: jobs.id,
          title: jobs.title,
          company: jobs.company,
          location: jobs.location,
          jobType: jobs.jobType,
        },
        applicant: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          branch: users.branch,
          resumeUrl: users.resumeUrl,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(users, eq(applications.applicantId, users.id))
      .where(inArray(applications.jobId, jobIds));

    } else if (user.role === 'student') {
      // Students can see their own applications
      applicationsQuery = db.select({
        id: applications.id,
        jobId: applications.jobId,
        applicantId: applications.applicantId,
        resumeUrl: applications.resumeUrl,
        coverLetter: applications.coverLetter,
        status: applications.status,
        appliedAt: applications.appliedAt,
        updatedAt: applications.updatedAt,
        job: {
          id: jobs.id,
          title: jobs.title,
          company: jobs.company,
          location: jobs.location,
          jobType: jobs.jobType,
        },
        applicant: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          branch: users.branch,
          resumeUrl: users.resumeUrl,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(users, eq(applications.applicantId, users.id))
      .where(eq(applications.applicantId, user.id));

    } else {
      // Other roles (faculty, etc.) can see their own applications
      applicationsQuery = db.select({
        id: applications.id,
        jobId: applications.jobId,
        applicantId: applications.applicantId,
        resumeUrl: applications.resumeUrl,
        coverLetter: applications.coverLetter,
        status: applications.status,
        appliedAt: applications.appliedAt,
        updatedAt: applications.updatedAt,
        job: {
          id: jobs.id,
          title: jobs.title,
          company: jobs.company,
          location: jobs.location,
          jobType: jobs.jobType,
        },
        applicant: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          branch: users.branch,
          resumeUrl: users.resumeUrl,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(users, eq(applications.applicantId, users.id))
      .where(eq(applications.applicantId, user.id));
    }

    // Apply additional filters
    let allApplications = await applicationsQuery;

    // Filter by status if provided
    if (status) {
      allApplications = allApplications.filter(app => app.status === status);
    }

    // Filter by jobId if provided
    if (jobId) {
      const jobIdNum = parseInt(jobId);
      if (!isNaN(jobIdNum)) {
        allApplications = allApplications.filter(app => app.jobId === jobIdNum);
      }
    }

    // Sort by appliedAt DESC
    allApplications.sort((a, b) => {
      const dateA = new Date(a.appliedAt).getTime();
      const dateB = new Date(b.appliedAt).getTime();
      return dateB - dateA;
    });

    // Apply pagination
    const paginatedResults = allApplications.slice(offset, offset + limit);

    // Log activity
    await db.insert(activityLog).values({
      userId: user.id,
      role: user.role,
      action: 'view_applications',
      metadata: JSON.stringify({ 
        resultCount: paginatedResults.length,
        totalCount: allApplications.length,
        filters: { status, jobId },
        role: user.role
      }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(paginatedResults);

  } catch (error) {
    console.error('GET applications error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs, applications, users, sessions, activityLog, auditLog } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

async function logActivity(userId: number, role: string, action: string, metadata: any) {
  try {
    await db.insert(activityLog).values({
      userId,
      role,
      action,
      metadata: metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

async function logAudit(actorId: number, actorRole: string, action: string, entityType: string, entityId: string, details: any, request: NextRequest) {
  try {
    await db.insert(auditLog).values({
      actorId,
      actorRole,
      action,
      entityType,
      entityId,
      details: details,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split('/')[3];
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid job ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const jobId = parseInt(id);

    const jobResults = await db.select({
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
      approvedBy: jobs.approvedBy,
      approvedAt: jobs.approvedAt,
      createdAt: jobs.createdAt,
      expiresAt: jobs.expiresAt,
      posterName: users.name,
      posterEmail: users.email,
      posterRole: users.role,
      posterCompany: users.headline,
      posterBranch: users.branch,
      posterProfileImageUrl: users.profileImageUrl,
    })
    .from(jobs)
    .leftJoin(users, eq(jobs.postedById, users.id))
    .where(eq(jobs.id, jobId))
    .limit(1);

    if (jobResults.length === 0) {
      return NextResponse.json({ 
        error: 'Job not found',
        code: 'JOB_NOT_FOUND' 
      }, { status: 404 });
    }

    const job = jobResults[0];

    if (user.role !== 'admin') {
      if (job.status !== 'approved') {
        return NextResponse.json({ 
          error: 'Job not found',
          code: 'JOB_NOT_FOUND' 
        }, { status: 404 });
      }

      const expiresAt = new Date(job.expiresAt);
      if (expiresAt < new Date()) {
        return NextResponse.json({ 
          error: 'Job not found',
          code: 'JOB_NOT_FOUND' 
        }, { status: 404 });
      }
    }

    await logActivity(user.id, user.role, 'view_job', { jobId: jobId });

    const response = {
      id: job.id,
      postedById: job.postedById,
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
      jobType: job.jobType,
      salary: job.salary,
      skills: job.skills,
      status: job.status,
      branch: job.branch,
      approvedBy: job.approvedBy,
      approvedAt: job.approvedAt,
      createdAt: job.createdAt,
      expiresAt: job.expiresAt,
      poster: {
        id: job.postedById,
        name: job.posterName,
        email: job.posterEmail,
        role: job.posterRole,
        company: job.posterCompany,
        branch: job.posterBranch,
        profileImageUrl: job.posterProfileImageUrl,
      }
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split('/')[3];
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid job ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const jobId = parseInt(id);

    const existingJob = await db.select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (existingJob.length === 0) {
      return NextResponse.json({ 
        error: 'Job not found',
        code: 'JOB_NOT_FOUND' 
      }, { status: 404 });
    }

    const job = existingJob[0];

    const isAdmin = user.role === 'admin';
    const isPoster = job.postedById === user.id;

    if (!isPoster && !isAdmin) {
      return NextResponse.json({ 
        error: 'You do not have permission to update this job',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const body = await request.json();

    const allowedFields = ['title', 'company', 'description', 'location', 'jobType', 'salary', 'skills', 'branch', 'expiresAt'];
    const adminOnlyFields = ['status', 'approvedBy'];

    const updates: any = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (isAdmin) {
      for (const field of adminOnlyFields) {
        if (field in body) {
          updates[field] = body[field];
        }
      }
    }

    if ('jobType' in updates) {
      const validJobTypes = ['full-time', 'internship', 'part-time'];
      if (!validJobTypes.includes(updates.jobType)) {
        return NextResponse.json({ 
          error: 'Invalid job type. Must be one of: full-time, internship, part-time',
          code: 'INVALID_JOB_TYPE' 
        }, { status: 400 });
      }
    }

    if ('expiresAt' in updates) {
      const expiresAt = new Date(updates.expiresAt);
      if (isNaN(expiresAt.getTime())) {
        return NextResponse.json({ 
          error: 'Invalid expiration date format',
          code: 'INVALID_EXPIRES_AT' 
        }, { status: 400 });
      }
      if (expiresAt < new Date()) {
        return NextResponse.json({ 
          error: 'Expiration date must be in the future',
          code: 'INVALID_EXPIRES_AT' 
        }, { status: 400 });
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields to update',
        code: 'NO_UPDATES' 
      }, { status: 400 });
    }

    const updated = await db.update(jobs)
      .set(updates)
      .where(eq(jobs.id, jobId))
      .returning();

    await logActivity(user.id, user.role, 'update_job', { jobId: jobId });

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split('/')[3];
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid job ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const jobId = parseInt(id);

    const existingJob = await db.select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (existingJob.length === 0) {
      return NextResponse.json({ 
        error: 'Job not found',
        code: 'JOB_NOT_FOUND' 
      }, { status: 404 });
    }

    const job = existingJob[0];

    const isAdmin = user.role === 'admin';
    const isPoster = job.postedById === user.id;

    if (!isPoster && !isAdmin) {
      return NextResponse.json({ 
        error: 'You do not have permission to delete this job',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    await db.delete(applications)
      .where(eq(applications.jobId, jobId));

    const deleted = await db.delete(jobs)
      .where(eq(jobs.id, jobId))
      .returning();

    await logActivity(user.id, user.role, 'delete_job', { jobId: jobId });

    if (isAdmin && !isPoster) {
      await logAudit(
        user.id,
        user.role,
        'delete_job',
        'job',
        jobId.toString(),
        { 
          jobTitle: job.title,
          postedById: job.postedById,
          reason: 'Admin deletion'
        },
        request
      );
    }

    return NextResponse.json({ 
      message: 'Job and related applications deleted successfully',
      deletedJob: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
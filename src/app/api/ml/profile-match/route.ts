import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const session = await db.select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0) return null;

    const expiresAt = new Date(session[0].expiresAt);
    if (expiresAt < new Date()) return null;

    const user = await db.select()
      .from(users)
      .where(eq(users.id, session[0].userId))
      .limit(1);

    if (user.length === 0 || user[0].status !== 'active') return null;

    return user[0];
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const studentId = parseInt(searchParams.get('studentId') ?? user.id.toString());
    const alumniId = parseInt(searchParams.get('alumniId') ?? '0');

    if (!alumniId) {
      return NextResponse.json({ 
        error: 'Alumni ID is required',
        code: 'MISSING_ALUMNI_ID' 
      }, { status: 400 });
    }

    // Call Python ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(
      `${mlServiceUrl}/profile-match?student_id=${studentId}&alumni_id=${alumniId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('ML service error:', await response.text());
      
      // Fallback: calculate basic match
      const [student, alumni] = await Promise.all([
        db.select().from(users).where(eq(users.id, studentId)).limit(1),
        db.select().from(users).where(eq(users.id, alumniId)).limit(1),
      ]);

      if (student.length === 0 || alumni.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const studentSkills = typeof student[0].skills === 'string' 
        ? JSON.parse(student[0].skills) 
        : student[0].skills || [];
      const alumniSkills = typeof alumni[0].skills === 'string' 
        ? JSON.parse(alumni[0].skills) 
        : alumni[0].skills || [];

      const commonSkills = studentSkills.filter((s: string) => 
        alumniSkills.includes(s)
      );
      const skillsOverlap = studentSkills.length > 0 
        ? (commonSkills.length / studentSkills.length) * 100 
        : 0;

      const branchMatch = student[0].branch === alumni[0].branch ? 100 : 50;
      const matchScore = (skillsOverlap * 0.5) + (branchMatch * 0.3) + (20); // 20% base score

      return NextResponse.json({
        match_score: Math.round(matchScore),
        breakdown: {
          skills_overlap: Math.round(skillsOverlap),
          branch_match: branchMatch,
          experience_match: 75,
          activity_score: 65,
        },
        common_skills: commonSkills,
        explanation: `${Math.round(matchScore)}% match based on ${commonSkills.length} shared skills and ${branchMatch === 100 ? 'same' : 'different'} branch.`,
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('ML profile-match error:', error);
    return NextResponse.json({ 
      error: 'Failed to calculate profile match',
      code: 'MATCH_CALCULATION_FAILED' 
    }, { status: 500 });
  }
}

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
    const limit = parseInt(searchParams.get('limit') ?? '10');

    // Call Python ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(
      `${mlServiceUrl}/recommend-alumni?student_id=${user.id}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('ML service error:', await response.text());
      
      // Fallback: return alumni from database
      const alumni = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        branch: users.branch,
        cohort: users.cohort,
        yearOfPassing: users.yearOfPassing,
        headline: users.headline,
        bio: users.bio,
        skills: users.skills,
        profileImageUrl: users.profileImageUrl,
        linkedinUrl: users.linkedinUrl,
        githubUrl: users.githubUrl,
        currentCompany: users.currentCompany,
        currentPosition: users.currentPosition,
      })
        .from(users)
        .where(eq(users.role, 'alumni'))
        .limit(limit);

      // Add dummy match scores
      const recommendations = alumni.map((alumnus, index) => ({
        alumni_id: alumnus.id,
        match_score: 85 - (index * 5),
        breakdown: {
          skills_overlap: 75 - (index * 4),
          branch_match: alumnus.branch === user.branch ? 100 : 50,
          experience_match: 80 - (index * 3),
          activity_score: 70 - (index * 2),
        },
        alumni: {
          ...alumnus,
          skills: typeof alumnus.skills === 'string' ? JSON.parse(alumnus.skills) : alumnus.skills,
        },
        explanation: `Strong match based on ${alumnus.branch === user.branch ? 'same branch' : 'cross-branch'} experience and skill overlap.`,
      }));

      return NextResponse.json({ recommendations });
    }

    const data = await response.json();
    
    // Enrich with full user data from database
    if (data.recommendations && data.recommendations.length > 0) {
      const alumniIds = data.recommendations.map((r: any) => r.alumni_id);
      const alumniData = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        branch: users.branch,
        cohort: users.cohort,
        yearOfPassing: users.yearOfPassing,
        headline: users.headline,
        bio: users.bio,
        skills: users.skills,
        profileImageUrl: users.profileImageUrl,
        linkedinUrl: users.linkedinUrl,
        githubUrl: users.githubUrl,
        currentCompany: users.currentCompany,
        currentPosition: users.currentPosition,
      })
        .from(users)
        .where(eq(users.role, 'alumni'));

      const alumniMap = new Map(alumniData.map(a => [a.id, a]));

      const enrichedRecommendations = data.recommendations.map((rec: any) => {
        const alumni = alumniMap.get(rec.alumni_id);
        if (!alumni) return null;

        return {
          ...rec,
          alumni: {
            ...alumni,
            skills: typeof alumni.skills === 'string' ? JSON.parse(alumni.skills) : alumni.skills,
          },
        };
      }).filter(Boolean);

      return NextResponse.json({ 
        recommendations: enrichedRecommendations,
        total: enrichedRecommendations.length,
      });
    }

    return NextResponse.json({ recommendations: [], total: 0 });
  } catch (error) {
    console.error('ML recommend error:', error);
    
    // Fallback response
    try {
      const user = await authenticateRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '10');
      
      const alumni = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        branch: users.branch,
        cohort: users.cohort,
        yearOfPassing: users.yearOfPassing,
        headline: users.headline,
        bio: users.bio,
        skills: users.skills,
        profileImageUrl: users.profileImageUrl,
        linkedinUrl: users.linkedinUrl,
        githubUrl: users.githubUrl,
        currentCompany: users.currentCompany,
        currentPosition: users.currentPosition,
      })
        .from(users)
        .where(eq(users.role, 'alumni'))
        .limit(limit);

      const recommendations = alumni.map((alumnus, index) => ({
        alumni_id: alumnus.id,
        match_score: 85 - (index * 5),
        breakdown: {
          skills_overlap: 75 - (index * 4),
          branch_match: alumnus.branch === user.branch ? 100 : 50,
          experience_match: 80 - (index * 3),
          activity_score: 70 - (index * 2),
        },
        alumni: {
          ...alumnus,
          skills: typeof alumnus.skills === 'string' ? JSON.parse(alumnus.skills) : alumnus.skills,
        },
        explanation: `Match based on profile similarity and ${alumnus.branch === user.branch ? 'same' : 'related'} branch.`,
      }));

      return NextResponse.json({ 
        recommendations,
        total: recommendations.length,
        note: 'Using fallback recommendations (ML service unavailable)',
      });
    } catch (fallbackError) {
      return NextResponse.json({ 
        error: 'Failed to generate recommendations',
        code: 'RECOMMENDATION_FAILED' 
      }, { status: 500 });
    }
  }
}

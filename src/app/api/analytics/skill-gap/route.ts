import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { industrySkills, users, sessions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) return null;

    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");
    const userId = targetUserId ? parseInt(targetUserId) : user.id;

    // Get user's current skills from their profile
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse skills from user profile (JSON array)
    let userSkillsData: string[] = [];
    if (targetUser.skills) {
      if (typeof targetUser.skills === "string") {
        try {
          userSkillsData = JSON.parse(targetUser.skills);
        } catch {
          userSkillsData = [];
        }
      } else if (Array.isArray(targetUser.skills)) {
        userSkillsData = targetUser.skills;
      }
    }
    const currentSkillNames = userSkillsData.map((s) => s.toLowerCase());

    // Get top industry skills
    const topIndustrySkills = await db
      .select()
      .from(industrySkills)
      .where(eq(industrySkills.isActive, true))
      .orderBy(
        sql`${industrySkills.upvotes} - ${industrySkills.downvotes} DESC`
      )
      .limit(50);

    // Calculate skill gaps
    const missingSkills = topIndustrySkills.filter(
      (skill) => !currentSkillNames.includes(skill.skillName.toLowerCase())
    );

    // Group by category and demand level
    const gapsByCategory = missingSkills.reduce(
      (acc, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
      },
      {} as Record<string, typeof missingSkills>
    );

    const highDemandGaps = missingSkills.filter(
      (s) => s.demandLevel === "high"
    );

    // Calculate match percentage
    const totalTopSkills = topIndustrySkills.length;
    const matchedSkills = totalTopSkills - missingSkills.length;
    const matchPercentage = Math.round((matchedSkills / totalTopSkills) * 100);

    // Get skill recommendations based on related skills
    const recommendations = [];
    for (const currentSkillName of currentSkillNames) {
      const relatedIndustrySkills = topIndustrySkills.filter((is) => {
        const related = is.relatedSkills as string[] | null;
        return (
          related && related.some((r) => r.toLowerCase() === currentSkillName)
        );
      });
      recommendations.push(...relatedIndustrySkills);
    }

    // Remove duplicates
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map((r) => [r.id, r])).values()
    );

    return NextResponse.json({
      success: true,
      analysis: {
        matchPercentage,
        totalIndustrySkills: totalTopSkills,
        matchedSkills: matchedSkills,
        missingSkills: missingSkills.length,
        highDemandGaps: highDemandGaps.length,
        gapsByCategory: Object.entries(gapsByCategory).map(
          ([category, skills]) => ({
            category,
            count: skills.length,
            skills: skills.slice(0, 5), // Top 5 per category
          })
        ),
        topGaps: highDemandGaps.slice(0, 10),
        recommendations: uniqueRecommendations.slice(0, 10),
        currentSkills: currentSkillNames.length,
      },
    });
  } catch (error) {
    console.error("Error analyzing skill gap:", error);
    return NextResponse.json(
      { error: "Failed to analyze skill gap" },
      { status: 500 }
    );
  }
}

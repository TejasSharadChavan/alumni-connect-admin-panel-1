import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  industrySkills,
  industrySkillVotes,
  users,
  sessions,
} from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

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

// GET - Fetch all industry skills
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const industry = searchParams.get("industry");

    let query = db
      .select({
        id: industrySkills.id,
        skillName: industrySkills.skillName,
        category: industrySkills.category,
        industry: industrySkills.industry,
        demandLevel: industrySkills.demandLevel,
        description: industrySkills.description,
        relatedSkills: industrySkills.relatedSkills,
        averageSalaryImpact: industrySkills.averageSalaryImpact,
        learningResources: industrySkills.learningResources,
        upvotes: industrySkills.upvotes,
        downvotes: industrySkills.downvotes,
        createdAt: industrySkills.createdAt,
        postedBy: industrySkills.postedBy,
        postedByName: users.name,
        postedByHeadline: users.headline,
      })
      .from(industrySkills)
      .leftJoin(users, eq(industrySkills.postedBy, users.id))
      .where(eq(industrySkills.isActive, true))
      .orderBy(desc(industrySkills.upvotes));

    const skills = await query;

    // Get user's votes
    const userVotes = await db
      .select()
      .from(industrySkillVotes)
      .where(eq(industrySkillVotes.userId, user.id));

    const votesMap = new Map(userVotes.map((v) => [v.skillId, v.voteType]));

    const skillsWithVotes = skills.map((skill) => ({
      ...skill,
      userVote: votesMap.get(skill.id) || null,
      netVotes: (skill.upvotes || 0) - (skill.downvotes || 0),
    }));

    return NextResponse.json({
      success: true,
      skills: skillsWithVotes,
    });
  } catch (error) {
    console.error("Error fetching industry skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

// POST - Create new industry skill (Alumni only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "alumni") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      skillName,
      category,
      industry,
      demandLevel,
      description,
      relatedSkills,
      averageSalaryImpact,
      learningResources,
    } = body;

    if (!skillName || !category || !industry || !demandLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const [newSkill] = await db
      .insert(industrySkills)
      .values({
        postedBy: user.id,
        skillName,
        category,
        industry,
        demandLevel,
        description: description || null,
        relatedSkills: relatedSkills || null,
        averageSalaryImpact: averageSalaryImpact || null,
        learningResources: learningResources || null,
        upvotes: 0,
        downvotes: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json({
      success: true,
      skill: newSkill,
    });
  } catch (error) {
    console.error("Error creating industry skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}

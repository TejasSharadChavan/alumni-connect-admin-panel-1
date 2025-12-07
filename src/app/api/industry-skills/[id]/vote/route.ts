import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  industrySkills,
  industrySkillVotes,
  users,
  sessions,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const skillId = parseInt(id);
    const { voteType } = await request.json(); // 'upvote' or 'downvote'

    if (!["upvote", "downvote"].includes(voteType)) {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    // Check if skill exists
    const [skill] = await db
      .select()
      .from(industrySkills)
      .where(eq(industrySkills.id, skillId))
      .limit(1);

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Check existing vote
    const [existingVote] = await db
      .select()
      .from(industrySkillVotes)
      .where(
        and(
          eq(industrySkillVotes.skillId, skillId),
          eq(industrySkillVotes.userId, user.id)
        )
      )
      .limit(1);

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote
        await db
          .delete(industrySkillVotes)
          .where(eq(industrySkillVotes.id, existingVote.id));

        // Update skill counts
        if (voteType === "upvote") {
          await db
            .update(industrySkills)
            .set({ upvotes: Math.max(0, (skill.upvotes || 0) - 1) })
            .where(eq(industrySkills.id, skillId));
        } else {
          await db
            .update(industrySkills)
            .set({ downvotes: Math.max(0, (skill.downvotes || 0) - 1) })
            .where(eq(industrySkills.id, skillId));
        }

        return NextResponse.json({ success: true, action: "removed" });
      } else {
        // Change vote
        await db
          .update(industrySkillVotes)
          .set({ voteType, createdAt: new Date().toISOString() })
          .where(eq(industrySkillVotes.id, existingVote.id));

        // Update skill counts
        if (voteType === "upvote") {
          await db
            .update(industrySkills)
            .set({
              upvotes: (skill.upvotes || 0) + 1,
              downvotes: Math.max(0, (skill.downvotes || 0) - 1),
            })
            .where(eq(industrySkills.id, skillId));
        } else {
          await db
            .update(industrySkills)
            .set({
              downvotes: (skill.downvotes || 0) + 1,
              upvotes: Math.max(0, (skill.upvotes || 0) - 1),
            })
            .where(eq(industrySkills.id, skillId));
        }

        return NextResponse.json({ success: true, action: "changed" });
      }
    } else {
      // Add new vote
      await db.insert(industrySkillVotes).values({
        skillId,
        userId: user.id,
        voteType,
        createdAt: new Date().toISOString(),
      });

      // Update skill counts
      if (voteType === "upvote") {
        await db
          .update(industrySkills)
          .set({ upvotes: (skill.upvotes || 0) + 1 })
          .where(eq(industrySkills.id, skillId));
      } else {
        await db
          .update(industrySkills)
          .set({ downvotes: (skill.downvotes || 0) + 1 })
          .where(eq(industrySkills.id, skillId));
      }

      return NextResponse.json({ success: true, action: "added" });
    }
  } catch (error) {
    console.error("Error voting on skill:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}

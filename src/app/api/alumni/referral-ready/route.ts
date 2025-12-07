import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions, applications, projectSubmissions } from "@/db/schema";
import { eq, and, count, sql } from "drizzle-orm";

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

function calculateReferralReadinessScore(
  student: any,
  stats: any,
  alumni: any
): number {
  let baseScore = 0;
  let bonusScore = 0;

  // === BASE SCORE (100 points) ===

  // 1. Skills completeness (25 points)
  const skills =
    typeof student.skills === "string"
      ? JSON.parse(student.skills || "[]")
      : student.skills || [];
  if (skills.length >= 5) baseScore += 25;
  else if (skills.length >= 3) baseScore += 15;
  else if (skills.length >= 1) baseScore += 5;

  // 2. Profile completeness (20 points)
  if (student.headline) baseScore += 5;
  if (student.bio) baseScore += 5;
  if (student.profileImageUrl) baseScore += 5;
  if (student.resumeUrl) baseScore += 5;

  // 3. Project experience (25 points)
  if (stats.projectCount >= 3) baseScore += 25;
  else if (stats.projectCount >= 2) baseScore += 15;
  else if (stats.projectCount >= 1) baseScore += 10;

  // 4. Job application activity (15 points)
  if (stats.applicationCount >= 5) baseScore += 15;
  else if (stats.applicationCount >= 3) baseScore += 10;
  else if (stats.applicationCount >= 1) baseScore += 5;

  // 5. Academic standing (15 points) - based on cohort
  if (student.cohort) {
    const currentYear = new Date().getFullYear();
    const studentYear = parseInt(student.cohort);
    if (!isNaN(studentYear)) {
      // Final year students get max points (graduating soon = urgent)
      if (currentYear - studentYear === 0) baseScore += 15;
      // Pre-final year students
      else if (currentYear - studentYear === -1) baseScore += 10;
      // Others
      else baseScore += 5;
    }
  }

  // === BONUS SCORE (35 points) - Alumni Match ===

  // 6. Branch alignment bonus (10 points)
  if (student.branch && alumni.branch) {
    if (
      student.branch.toLowerCase().trim() === alumni.branch.toLowerCase().trim()
    ) {
      bonusScore += 10; // Same branch = alumni can vouch better
    } else if (
      student.branch.toLowerCase().includes("computer") &&
      alumni.branch.toLowerCase().includes("computer")
    ) {
      bonusScore += 7; // Similar tech branch
    } else if (
      student.branch.toLowerCase().includes("engineering") &&
      alumni.branch.toLowerCase().includes("engineering")
    ) {
      bonusScore += 3; // Same domain
    }
  }

  // 7. Skill overlap bonus (15 points)
  const alumniSkills =
    typeof alumni.skills === "string"
      ? JSON.parse(alumni.skills || "[]")
      : alumni.skills || [];
  const matchingSkills = skills.filter((skill: string) =>
    alumniSkills.some(
      (aSkill: string) => aSkill.toLowerCase() === skill.toLowerCase()
    )
  );
  if (matchingSkills.length >= 3) bonusScore += 15;
  else if (matchingSkills.length >= 2) bonusScore += 10;
  else if (matchingSkills.length >= 1) bonusScore += 5;

  // 8. Recent activity bonus (10 points)
  // If student has applied recently, they're actively job hunting
  if (stats.applicationCount > 0) {
    bonusScore += 10; // Active job seeker
  }

  const totalScore = Math.min(baseScore + bonusScore, 100);
  return Math.round(totalScore);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "alumni") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all students
    const allStudents = await db
      .select()
      .from(users)
      .where(eq(users.role, "student"));

    // Get stats for each student with smart scoring
    const studentsWithStats = await Promise.all(
      allStudents.map(async (student) => {
        try {
          // Get project count (projects submitted by this student)
          const projectData = await db
            .select({ count: count() })
            .from(projectSubmissions)
            .where(eq(projectSubmissions.submittedBy, student.id));
          const projectCount = projectData[0]?.count || 0;

          // Get application count
          const applicationData = await db
            .select({ count: count() })
            .from(applications)
            .where(eq(applications.applicantId, student.id));
          const applicationCount = applicationData[0]?.count || 0;

          const stats = { projectCount, applicationCount };

          // Calculate score with alumni match bonus
          const readinessScore = calculateReferralReadinessScore(
            student,
            stats,
            user
          );

          return {
            ...student,
            stats,
            readinessScore,
            skills:
              typeof student.skills === "string"
                ? JSON.parse(student.skills || "[]")
                : student.skills || [],
          };
        } catch (error) {
          console.error(`Error processing student ${student.id}:`, error);
          // Return student with 0 score if error
          return {
            ...student,
            stats: { projectCount: 0, applicationCount: 0 },
            readinessScore: 0,
            skills: [],
          };
        }
      })
    );

    // Filter and sort by readiness score (lowered threshold to 40)
    const referralReady = studentsWithStats
      .filter((s) => s.readinessScore >= 40) // Show students with 40+ score
      .sort((a, b) => b.readinessScore - a.readinessScore)
      .slice(0, 30) // Increased limit to show more students
      .map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        branch: s.branch,
        cohort: s.cohort,
        skills: s.skills,
        headline: s.headline,
        bio: s.bio,
        profileImageUrl: s.profileImageUrl,
        resumeUrl: s.resumeUrl,
        readinessScore: s.readinessScore,
        stats: s.stats,
      }));

    // Categorize by readiness level (with smart categories)
    const highlyReady = referralReady.filter((s) => s.readinessScore >= 75); // Immediate referral
    const ready = referralReady.filter(
      (s) => s.readinessScore >= 60 && s.readinessScore < 75 // Good candidates
    );
    const emerging = referralReady.filter(
      (s) => s.readinessScore >= 50 && s.readinessScore < 60 // Potential with guidance
    );
    const potential = referralReady.filter((s) => s.readinessScore < 50); // Close to ready

    return NextResponse.json({
      success: true,
      referralReady: {
        highlyReady,
        ready,
        emerging,
        potential,
        total: referralReady.length,
        algorithm: {
          version: "2.0",
          features: [
            "Alumni skill match bonus",
            "Branch alignment bonus",
            "Active job seeker detection",
            "Lowered threshold (40%)",
          ],
        },
      },
    });
  } catch (error) {
    console.error("Error getting referral-ready students:", error);
    return NextResponse.json(
      { error: "Failed to get referral-ready students" },
      { status: 500 }
    );
  }
}

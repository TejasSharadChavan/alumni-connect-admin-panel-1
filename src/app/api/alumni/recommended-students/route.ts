import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions, mentorshipRequests } from "@/db/schema";
import { eq, and, ne, notInArray, sql } from "drizzle-orm";

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

function calculateMatchScore(alumni: any, student: any): number {
  let score = 0;

  // Parse skills
  const alumniSkills =
    typeof alumni.skills === "string"
      ? JSON.parse(alumni.skills || "[]")
      : alumni.skills || [];
  const studentSkills =
    typeof student.skills === "string"
      ? JSON.parse(student.skills || "[]")
      : student.skills || [];

  // 1. Skill match (40 points)
  const matchingSkills = alumniSkills.filter((skill: string) =>
    studentSkills.some((s: string) => s.toLowerCase() === skill.toLowerCase())
  );
  score += Math.min(
    (matchingSkills.length / Math.max(alumniSkills.length, 1)) * 40,
    40
  );

  // 2. Branch alignment (30 points)
  if (alumni.branch && student.branch) {
    if (alumni.branch.toLowerCase() === student.branch.toLowerCase()) {
      score += 30;
    } else if (
      alumni.branch.toLowerCase().includes("computer") &&
      student.branch.toLowerCase().includes("computer")
    ) {
      score += 20;
    } else if (
      alumni.branch.toLowerCase().includes("engineering") &&
      student.branch.toLowerCase().includes("engineering")
    ) {
      score += 10;
    }
  }

  // 3. Career interest match (20 points)
  if (alumni.company && student.careerInterests) {
    const interests =
      typeof student.careerInterests === "string"
        ? student.careerInterests.toLowerCase()
        : "";
    if (interests.includes("software") || interests.includes("tech")) {
      score += 20;
    }
  }

  // 4. Cohort proximity (10 points) - prefer recent graduates
  if (alumni.cohort && student.cohort) {
    const alumniYear = parseInt(alumni.cohort);
    const studentYear = parseInt(student.cohort);
    if (!isNaN(alumniYear) && !isNaN(studentYear)) {
      const yearDiff = Math.abs(alumniYear - studentYear);
      if (yearDiff <= 2) score += 10;
      else if (yearDiff <= 5) score += 5;
    }
  }

  return Math.round(score);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "alumni") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get students who already have mentorship with this alumni
    const existingMentorships = await db
      .select({ studentId: mentorshipRequests.studentId })
      .from(mentorshipRequests)
      .where(
        and(
          eq(mentorshipRequests.mentorId, user.id),
          ne(mentorshipRequests.status, "rejected")
        )
      );

    const existingStudentIds = existingMentorships.map((m) => m.studentId);

    // Get all students (excluding those with existing mentorship)
    let studentsQuery = db
      .select()
      .from(users)
      .where(eq(users.role, "student"));

    if (existingStudentIds.length > 0) {
      studentsQuery = studentsQuery.where(
        notInArray(users.id, existingStudentIds)
      ) as any;
    }

    const allStudents = await studentsQuery;

    // Calculate match scores for each student
    const studentsWithScores = allStudents
      .map((student) => ({
        ...student,
        matchScore: calculateMatchScore(user, student),
        skills:
          typeof student.skills === "string"
            ? JSON.parse(student.skills || "[]")
            : student.skills || [],
      }))
      .filter((s) => s.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    // Categorize students
    const highPriority = studentsWithScores.filter((s) => s.matchScore >= 70);
    const goodMatch = studentsWithScores.filter(
      (s) => s.matchScore >= 50 && s.matchScore < 70
    );
    const potentialMatch = studentsWithScores.filter((s) => s.matchScore < 50);

    // Get students needing help (academically weak students)
    // Criteria: Few skills, low profile completion, recent cohort (current students)
    const currentYear = new Date().getFullYear();
    const studentsNeedingHelp = allStudents
      .map((student) => {
        const skills =
          typeof student.skills === "string"
            ? JSON.parse(student.skills || "[]")
            : student.skills || [];
        const cohortYear = parseInt(student.cohort || "0");
        const isCurrentStudent = cohortYear >= currentYear - 1; // Current or recent students

        // Calculate "need help" score (higher = more help needed)
        let needScore = 0;

        // Few or no skills (0-30 points)
        if (skills.length === 0) needScore += 30;
        else if (skills.length <= 2) needScore += 20;
        else if (skills.length <= 4) needScore += 10;

        // Incomplete profile (0-25 points)
        if (!student.headline) needScore += 10;
        if (!student.bio) needScore += 10;
        if (!student.resumeUrl) needScore += 5;

        // Current student (0-20 points) - prioritize helping current students
        if (isCurrentStudent) needScore += 20;

        // No profile image (0-10 points)
        if (!student.profileImageUrl) needScore += 10;

        // Branch match with alumni (0-15 points) - can help better in same field
        if (student.branch && user.branch) {
          if (student.branch.toLowerCase() === user.branch.toLowerCase()) {
            needScore += 15;
          } else if (
            student.branch.toLowerCase().includes("computer") &&
            user.branch.toLowerCase().includes("computer")
          ) {
            needScore += 10;
          }
        }

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          branch: student.branch,
          cohort: student.cohort,
          skills: skills,
          profileImageUrl: student.profileImageUrl,
          headline: student.headline,
          bio: student.bio,
          resumeUrl: student.resumeUrl,
          needScore: needScore,
          weaknesses: [
            skills.length === 0
              ? "No skills listed"
              : skills.length <= 2
                ? "Limited skills"
                : null,
            !student.headline ? "No headline" : null,
            !student.bio ? "Incomplete profile" : null,
            !student.resumeUrl ? "No resume" : null,
          ].filter(Boolean),
        };
      })
      .filter((s) => s.needScore >= 30) // Only show students who need significant help
      .sort((a, b) => b.needScore - a.needScore)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      recommendations: {
        highPriority: highPriority.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          branch: s.branch,
          cohort: s.cohort,
          skills: s.skills,
          matchScore: s.matchScore,
          profileImageUrl: s.profileImageUrl,
          headline: s.headline,
        })),
        goodMatch: goodMatch.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          branch: s.branch,
          cohort: s.cohort,
          skills: s.skills,
          matchScore: s.matchScore,
          profileImageUrl: s.profileImageUrl,
          headline: s.headline,
        })),
        potentialMatch: potentialMatch.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          branch: s.branch,
          cohort: s.cohort,
          skills: s.skills,
          matchScore: s.matchScore,
          profileImageUrl: s.profileImageUrl,
          headline: s.headline,
        })),
        needingHelp: studentsNeedingHelp,
      },
    });
  } catch (error) {
    console.error("Error getting student recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}

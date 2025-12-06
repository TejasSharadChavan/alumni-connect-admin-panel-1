import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  connections,
  jobs,
  applications,
  mentorshipRequests,
  activityLog,
} from "@/db/schema";
import { eq, and, or, inArray, sql, desc } from "drizzle-orm";

// Helper function to parse skills from database
function parseSkills(skills: any): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  if (typeof skills === "string") {
    try {
      const parsed = JSON.parse(skills);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// AI-powered skill gap analysis
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Get current user
    const [session] = await db
      .select()
      .from(require("@/db/schema").sessions)
      .where(eq(require("@/db/schema").sessions.token, token))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get student profile
    const [student] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "Not a student" }, { status: 403 });
    }

    const studentSkills = parseSkills(student.skills);

    // Get connected alumni (accepted connections)
    const connectedAlumni = await db
      .select({
        id: users.id,
        name: users.name,
        headline: users.headline,
        skills: users.skills,
        company: sql<string>`COALESCE(${users.headline}, '')`,
        profileImageUrl: users.profileImageUrl,
        yearOfPassing: users.yearOfPassing,
        branch: users.branch,
      })
      .from(connections)
      .innerJoin(
        users,
        or(
          and(
            eq(connections.responderId, users.id),
            eq(connections.requesterId, session.userId)
          ),
          and(
            eq(connections.requesterId, users.id),
            eq(connections.responderId, session.userId)
          )
        )
      )
      .where(and(eq(connections.status, "accepted"), eq(users.role, "alumni")));

    // Get all alumni in student's branch for comparison
    const branchAlumni = await db
      .select({
        id: users.id,
        name: users.name,
        headline: users.headline,
        skills: users.skills,
        yearOfPassing: users.yearOfPassing,
      })
      .from(users)
      .where(
        and(eq(users.role, "alumni"), eq(users.branch, student.branch || ""))
      )
      .limit(100);

    // Get active job postings to understand market demand
    const activeJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        company: jobs.company,
        skills: jobs.skills,
        jobType: jobs.jobType,
        salary: jobs.salary,
      })
      .from(jobs)
      .where(eq(jobs.status, "approved"))
      .orderBy(desc(jobs.createdAt))
      .limit(50);

    // Get student's job applications to understand interests
    const studentApplications = await db
      .select({
        jobId: applications.jobId,
        jobTitle: jobs.title,
        jobSkills: jobs.skills,
        status: applications.status,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.applicantId, session.userId))
      .orderBy(desc(applications.appliedAt));

    // Get mentorship requests to understand learning interests
    const mentorshipInterests = await db
      .select({
        mentorId: mentorshipRequests.mentorId,
        topic: mentorshipRequests.topic,
        status: mentorshipRequests.status,
      })
      .from(mentorshipRequests)
      .where(eq(mentorshipRequests.studentId, session.userId));

    // === AI-POWERED ANALYSIS ===

    // 1. Analyze skill frequency across alumni
    const skillFrequency = new Map<string, number>();
    const skillByRole = new Map<string, Set<string>>();

    branchAlumni.forEach((alumni) => {
      const alumniSkills = parseSkills(alumni.skills);
      const role = alumni.headline || "Professional";

      alumniSkills.forEach((skill) => {
        skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 1);

        if (!skillByRole.has(skill)) {
          skillByRole.set(skill, new Set());
        }
        skillByRole.get(skill)!.add(role);
      });
    });

    // 2. Analyze job market demand
    const jobSkillDemand = new Map<
      string,
      { count: number; avgSalary: string; roles: Set<string> }
    >();

    activeJobs.forEach((job) => {
      const jobSkills = parseSkills(job.skills);
      jobSkills.forEach((skill) => {
        if (!jobSkillDemand.has(skill)) {
          jobSkillDemand.set(skill, {
            count: 0,
            avgSalary: "",
            roles: new Set(),
          });
        }
        const demand = jobSkillDemand.get(skill)!;
        demand.count++;
        demand.roles.add(job.title);
        if (job.salary) demand.avgSalary = job.salary;
      });
    });

    // 3. Calculate skill gaps
    const allRelevantSkills = new Set([
      ...Array.from(skillFrequency.keys()),
      ...Array.from(jobSkillDemand.keys()),
    ]);

    const skillGaps = Array.from(allRelevantSkills)
      .filter((skill) => !studentSkills.includes(skill))
      .map((skill) => {
        const alumniCount = skillFrequency.get(skill) || 0;
        const jobCount = jobSkillDemand.get(skill)?.count || 0;
        const demand = jobSkillDemand.get(skill);

        // Calculate importance score (0-100)
        const alumniScore = Math.min(
          (alumniCount / branchAlumni.length) * 50,
          50
        );
        const jobScore = Math.min((jobCount / activeJobs.length) * 50, 50);
        const importanceScore = Math.round(alumniScore + jobScore);

        return {
          skill,
          importanceScore,
          alumniWithSkill: alumniCount,
          jobsRequiring: jobCount,
          demandLevel:
            importanceScore > 70
              ? "High"
              : importanceScore > 40
                ? "Medium"
                : "Low",
          avgSalary: demand?.avgSalary || null,
          commonRoles: Array.from(demand?.roles || []).slice(0, 3),
        };
      })
      .sort((a, b) => b.importanceScore - a.importanceScore)
      .slice(0, 15);

    // 4. Analyze student's current skills
    const currentSkillsAnalysis = studentSkills.map((skill) => {
      const alumniCount = skillFrequency.get(skill) || 0;
      const jobCount = jobSkillDemand.get(skill)?.count || 0;
      const demand = jobSkillDemand.get(skill);

      return {
        skill,
        proficiencyLevel: "Intermediate", // Could be enhanced with user input
        alumniWithSkill: alumniCount,
        jobsRequiring: jobCount,
        demandLevel: jobCount > 10 ? "High" : jobCount > 5 ? "Medium" : "Low",
        marketValue: demand?.avgSalary || null,
        commonRoles: Array.from(demand?.roles || []).slice(0, 3),
      };
    });

    // 5. Generate personalized learning path based on followed alumni
    const learningPath = connectedAlumni.slice(0, 3).map((alumni) => {
      const alumniSkills = parseSkills(alumni.skills);
      const missingSkills = alumniSkills.filter(
        (s) => !studentSkills.includes(s)
      );

      return {
        alumniId: alumni.id,
        alumniName: alumni.name,
        alumniRole: alumni.headline || "Professional",
        alumniImage: alumni.profileImageUrl,
        currentPosition: alumni.headline,
        yearsExperience: alumni.yearOfPassing
          ? new Date().getFullYear() - alumni.yearOfPassing
          : null,
        skillsToLearn: missingSkills.slice(0, 5),
        estimatedTimeToReach: `${Math.ceil(missingSkills.length / 2)}-${Math.ceil(missingSkills.length / 1.5)} months`,
        recommendedActions: [
          missingSkills.length > 0
            ? `Learn ${missingSkills[0]}`
            : "Connect more",
          "Request mentorship session",
          "Apply to similar roles",
        ],
      };
    });

    // 6. Career trajectory insights
    const careerInsights = {
      targetRoles: Array.from(
        new Set(studentApplications.map((app) => app.jobTitle).slice(0, 3))
      ),
      skillsNeededForTargetRoles: Array.from(
        new Set(
          studentApplications
            .flatMap((app) => parseSkills(app.jobSkills))
            .filter((s) => !studentSkills.includes(s))
        )
      ).slice(0, 8),
      alumniInTargetRoles: connectedAlumni.filter((alumni) =>
        studentApplications.some((app) =>
          alumni.headline?.toLowerCase().includes(app.jobTitle.toLowerCase())
        )
      ).length,
    };

    // 7. AI-generated insights
    const aiInsights = generateAIInsights(
      student,
      studentSkills,
      skillGaps,
      connectedAlumni,
      careerInsights,
      studentApplications
    );

    // 8. Skill development recommendations
    const recommendations = generateRecommendations(
      skillGaps,
      studentApplications,
      mentorshipInterests,
      connectedAlumni
    );

    return NextResponse.json({
      success: true,
      data: {
        student: {
          name: student.name,
          branch: student.branch,
          cohort: student.cohort,
          currentSkills: studentSkills.length,
        },
        skillGapAnalysis: {
          currentSkills: currentSkillsAnalysis,
          missingSkills: skillGaps,
          totalGaps: skillGaps.length,
          criticalGaps: skillGaps.filter((g) => g.importanceScore > 70).length,
        },
        careerPath: {
          connectedAlumni: connectedAlumni.length,
          learningPaths: learningPath,
          careerInsights,
        },
        marketIntelligence: {
          totalJobsAnalyzed: activeJobs.length,
          totalAlumniAnalyzed: branchAlumni.length,
          topDemandSkills: Array.from(jobSkillDemand.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10)
            .map(([skill, data]) => ({
              skill,
              demand: data.count,
              roles: Array.from(data.roles).slice(0, 3),
            })),
        },
        aiInsights,
        recommendations,
      },
    });
  } catch (error) {
    console.error("Skill gap analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze skill gaps",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// AI-powered insight generation
function generateAIInsights(
  student: any,
  studentSkills: string[],
  skillGaps: any[],
  connectedAlumni: any[],
  careerInsights: any,
  applications: any[]
) {
  const insights = [];

  // Insight 1: Skill coverage
  const totalRelevantSkills = studentSkills.length + skillGaps.length;
  const coverage = Math.round(
    (studentSkills.length / totalRelevantSkills) * 100
  );

  insights.push({
    type: "skill_coverage",
    title: "Your Skill Coverage",
    message: `You have ${coverage}% of the skills commonly found in ${student.branch} alumni. ${
      coverage < 50
        ? "Focus on building foundational skills to catch up with your peers."
        : coverage < 75
          ? "You're on the right track! Focus on high-demand skills to stand out."
          : "Excellent! You're well-positioned. Consider specializing in niche areas."
    }`,
    score: coverage,
    priority: coverage < 50 ? "high" : coverage < 75 ? "medium" : "low",
  });

  // Insight 2: Career readiness
  if (applications.length > 0) {
    const appliedSkills = new Set(
      applications.flatMap((app) => parseSkills(app.jobSkills))
    );
    const matchingSkills = studentSkills.filter((s) => appliedSkills.has(s));
    const readiness = Math.round(
      (matchingSkills.length / appliedSkills.size) * 100
    );

    insights.push({
      type: "career_readiness",
      title: "Job Application Readiness",
      message: `Based on your ${applications.length} job applications, you have ${readiness}% of the required skills. ${
        readiness < 60
          ? `Focus on learning ${Array.from(appliedSkills)
              .filter((s) => !studentSkills.includes(s))
              .slice(0, 3)
              .join(", ")} to improve your chances.`
          : "You're well-prepared for the roles you're targeting!"
      }`,
      score: readiness,
      priority: readiness < 60 ? "high" : "medium",
    });
  }

  // Insight 3: Alumni connection value
  if (connectedAlumni.length > 0) {
    const alumniSkills = new Set(
      connectedAlumni.flatMap((a) => parseSkills(a.skills))
    );
    const learnableSkills = Array.from(alumniSkills).filter(
      (s) => !studentSkills.includes(s)
    );

    insights.push({
      type: "network_value",
      title: "Your Network's Knowledge Pool",
      message: `Your ${connectedAlumni.length} connected alumni collectively have ${alumniSkills.size} unique skills. You can learn ${learnableSkills.length} new skills from them. Consider requesting mentorship sessions!`,
      score: learnableSkills.length,
      priority: "medium",
      actionable: true,
      action: "Request mentorship",
    });
  } else {
    insights.push({
      type: "network_building",
      title: "Build Your Network",
      message:
        "You haven't connected with any alumni yet. Building connections can provide mentorship, job referrals, and insider knowledge about career paths.",
      score: 0,
      priority: "high",
      actionable: true,
      action: "Connect with alumni",
    });
  }

  // Insight 4: High-impact skills
  const highImpactGaps = skillGaps.filter((g) => g.importanceScore > 70);
  if (highImpactGaps.length > 0) {
    insights.push({
      type: "high_impact_skills",
      title: "High-Impact Skill Gaps",
      message: `${highImpactGaps.length} critical skills are missing from your profile: ${highImpactGaps
        .slice(0, 3)
        .map((g) => g.skill)
        .join(
          ", "
        )}. These are in high demand and could significantly boost your career prospects.`,
      skills: highImpactGaps.slice(0, 5).map((g) => g.skill),
      priority: "high",
      actionable: true,
    });
  }

  return insights;
}

// Generate personalized recommendations
function generateRecommendations(
  skillGaps: any[],
  applications: any[],
  mentorshipInterests: any[],
  connectedAlumni: any[]
) {
  const recommendations = [];

  // Recommendation 1: Priority skills to learn
  const topGaps = skillGaps.slice(0, 5);
  if (topGaps.length > 0) {
    recommendations.push({
      category: "skill_development",
      title: "Priority Skills to Learn",
      description: "Based on market demand and alumni success patterns",
      items: topGaps.map((gap) => ({
        skill: gap.skill,
        reason: `${gap.jobsRequiring} jobs require this skill`,
        demand: gap.demandLevel,
        estimatedTime: "2-3 months",
        resources: ["Online courses", "Practice projects", "Alumni mentorship"],
      })),
      priority: "high",
    });
  }

  // Recommendation 2: Alumni to connect with
  if (connectedAlumni.length < 5) {
    recommendations.push({
      category: "networking",
      title: "Expand Your Network",
      description: "Connect with alumni who can guide your career path",
      items: [
        {
          action: "Connect with 3-5 alumni in your target role",
          benefit: "Get insider knowledge and potential referrals",
          priority: "high",
        },
        {
          action: "Request mentorship from experienced professionals",
          benefit: "Personalized guidance and skill development",
          priority: "medium",
        },
      ],
      priority: "high",
    });
  }

  // Recommendation 3: Job application strategy
  if (applications.length > 0) {
    const pendingApps = applications.filter((a) => a.status === "applied");
    if (pendingApps.length > 3) {
      recommendations.push({
        category: "job_search",
        title: "Optimize Your Job Search",
        description: "Strategic approach to improve success rate",
        items: [
          {
            action: "Focus on roles matching 70%+ of your skills",
            benefit: "Higher chance of getting interviews",
          },
          {
            action: "Get resume reviewed by alumni in target companies",
            benefit: "Insider tips and potential referrals",
          },
          {
            action: "Build projects showcasing missing skills",
            benefit: "Demonstrate learning ability to employers",
          },
        ],
        priority: "medium",
      });
    }
  }

  // Recommendation 4: Skill validation
  recommendations.push({
    category: "skill_validation",
    title: "Validate Your Skills",
    description: "Prove your expertise to employers",
    items: [
      {
        action: "Build portfolio projects",
        benefit: "Tangible proof of your abilities",
        priority: "high",
      },
      {
        action: "Contribute to open source",
        benefit: "Real-world experience and visibility",
        priority: "medium",
      },
      {
        action: "Get certifications for key skills",
        benefit: "Industry-recognized credentials",
        priority: "medium",
      },
    ],
    priority: "medium",
  });

  return recommendations;
}

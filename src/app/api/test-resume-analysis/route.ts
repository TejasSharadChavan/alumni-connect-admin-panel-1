import { NextRequest, NextResponse } from "next/server";
import { analyzeResumeForJob } from "@/lib/openai";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing resume analysis with dummy data...");

    // Dummy resume text
    const dummyResumeText = `
John Doe
Software Engineer

EXPERIENCE:
- 3 years of experience in React and Node.js development
- Built multiple web applications using JavaScript, TypeScript
- Experience with databases like MongoDB and PostgreSQL
- Worked with REST APIs and GraphQL
- Familiar with Git, Docker, and AWS

EDUCATION:
- Bachelor's in Computer Science
- Graduated 2021

SKILLS:
- JavaScript, TypeScript, React, Node.js
- HTML, CSS, Python
- MongoDB, PostgreSQL
- Git, Docker, AWS
- Problem solving, teamwork
`;

    // Dummy job details
    const jobTitle = "Frontend Developer";
    const jobDescription =
      "We are looking for a Frontend Developer with experience in React, JavaScript, and modern web technologies. The ideal candidate should have 2+ years of experience and knowledge of TypeScript.";
    const requiredSkills = ["React", "JavaScript", "TypeScript", "HTML", "CSS"];

    console.log("Starting AI analysis with dummy data...");

    const analysis = await analyzeResumeForJob(
      dummyResumeText,
      jobDescription,
      jobTitle,
      requiredSkills
    );

    console.log("Analysis completed successfully:", analysis);

    return NextResponse.json({
      success: true,
      message: "Resume analysis test completed successfully",
      analysis: analysis,
      testData: {
        resumeLength: dummyResumeText.length,
        jobTitle,
        requiredSkills,
      },
    });
  } catch (error) {
    console.error("Resume analysis test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
      { status: 500 }
    );
  }
}

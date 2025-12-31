import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, users, sessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { analyzeResumeForJob, extractTextFromPDF } from "@/lib/openai";
import { parseDocument } from "@/lib/document-parser";

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const session = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date().toISOString())
      )
    )
    .limit(1);

  if (session.length === 0) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session[0].userId))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        {
          error: "Only students can analyze resumes",
          code: "NOT_STUDENT",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("resume") as File;
    const jobId = formData.get("jobId") as string;

    if (!file) {
      return NextResponse.json(
        {
          error: "Resume file is required",
          code: "NO_FILE",
        },
        { status: 400 }
      );
    }

    if (!jobId || isNaN(parseInt(jobId))) {
      return NextResponse.json(
        {
          error: "Valid job ID is required",
          code: "INVALID_JOB_ID",
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Only PDF, DOC, and DOCX files are supported. Current file type: " +
            file.type,
          code: "INVALID_FILE_TYPE",
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "File size must be less than 5MB",
          code: "FILE_TOO_LARGE",
        },
        { status: 400 }
      );
    }

    // Get job details
    const job = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, parseInt(jobId)))
      .limit(1);

    if (job.length === 0) {
      return NextResponse.json(
        {
          error: "Job not found",
          code: "JOB_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const jobData = job[0];

    // Parse required skills
    let requiredSkills: string[] = [];
    if (jobData.skills) {
      try {
        requiredSkills =
          typeof jobData.skills === "string"
            ? JSON.parse(jobData.skills)
            : jobData.skills;
      } catch (e) {
        requiredSkills = [];
      }
    }

    // Extract text from resume
    let resumeText = "";

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.type === "application/pdf") {
        console.log("Processing PDF file:", file.name);
        resumeText = await extractTextFromPDF(buffer);
      } else if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        console.log("Processing DOC/DOCX file:", file.name, "Type:", file.type);
        resumeText = await parseDocument(buffer, file.type);
      } else {
        console.log("Unsupported file type:", file.type);
        return NextResponse.json(
          {
            error: `Unsupported file format: ${file.type}. Please upload PDF, DOC, or DOCX files only.`,
            code: "UNSUPPORTED_FORMAT",
          },
          { status: 400 }
        );
      }
    } catch (extractionError) {
      console.error("Document extraction error:", extractionError);
      return NextResponse.json(
        {
          error:
            extractionError instanceof Error
              ? extractionError.message
              : "Failed to extract text from document. Please ensure the file is valid and contains readable text.",
          code: "DOCUMENT_EXTRACTION_FAILED",
        },
        { status: 400 }
      );
    }

    if (!resumeText || !resumeText.trim()) {
      return NextResponse.json(
        {
          error:
            "No text content found in the PDF. Please ensure your resume contains readable text and is not image-based.",
          code: "NO_TEXT_EXTRACTED",
        },
        { status: 400 }
      );
    }

    // Log extracted text length for debugging
    console.log(`Extracted text length: ${resumeText.length} characters`);
    console.log(`First 200 characters: ${resumeText.substring(0, 200)}...`);

    // Analyze resume against job
    try {
      console.log("Starting AI analysis...");
      const analysis = await analyzeResumeForJob(
        resumeText,
        jobData.description,
        jobData.title,
        requiredSkills
      );

      console.log("AI analysis completed successfully");
      return NextResponse.json({
        success: true,
        analysis: {
          summary: analysis.summary,
          matchingScore: analysis.matchingScore,
          skillsMatch: analysis.skillsMatch,
          experienceMatch: analysis.experienceMatch,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          recommendations: analysis.recommendations,
          keyHighlights: analysis.keyHighlights,
        },
        debug: {
          textLength: resumeText.length,
          hasContent: resumeText.length > 0,
        },
      });
    } catch (analysisError) {
      console.error("AI analysis error:", analysisError);
      return NextResponse.json(
        {
          error:
            analysisError instanceof Error
              ? analysisError.message
              : "Failed to analyze resume with AI. Please try again.",
          code: "AI_ANALYSIS_FAILED",
          debug: {
            textLength: resumeText.length,
            textPreview: resumeText.substring(0, 200),
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze resume: " + (error as Error).message,
        code: "ANALYSIS_FAILED",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { multiAI } from "@/lib/ai-providers";

export async function GET() {
  try {
    console.log("🧪 Testing all AI providers...");

    // Test all providers
    const providerStatus = await multiAI.testAllProviders();

    // Test resume analysis with mock data
    const mockResumeText = `
John Doe
Software Engineer

Experience:
- 3 years as Full Stack Developer at TechCorp
- Built web applications using React, Node.js, and MongoDB
- Led team of 4 developers on e-commerce platform

Skills:
JavaScript, React, Node.js, MongoDB, Python, AWS, Docker

Education:
Bachelor of Computer Science, MIT (2020)
`;

    const mockJobDescription =
      "We are looking for a Full Stack Developer with experience in React and Node.js";
    const mockJobTitle = "Full Stack Developer";
    const mockRequiredSkills = ["React", "Node.js", "JavaScript", "MongoDB"];

    console.log("🤖 Testing resume analysis...");
    const analysis = await multiAI.analyzeResume(
      mockResumeText,
      mockJobDescription,
      mockJobTitle,
      mockRequiredSkills
    );

    return NextResponse.json({
      success: true,
      message: "AI providers tested successfully!",
      providerStatus,
      sampleAnalysis: {
        summary: analysis.summary,
        matchingScore: analysis.matchingScore,
        skillsMatch: analysis.skillsMatch,
        provider: "Multi-Provider AI System",
      },
      availableProviders: {
        "Google Gemini": {
          status: providerStatus.gemini ? "✅ Available" : "❌ Not configured",
          description: "FREE - 15 requests/minute",
          setup: "Add GOOGLE_AI_API_KEY to .env",
        },
        Groq: {
          status: providerStatus.groq ? "✅ Available" : "❌ Not configured",
          description: "FREE - Very fast inference",
          setup: "Add GROQ_API_KEY to .env",
        },
        "Mock AI": {
          status: "✅ Always Available",
          description: "Intelligent fallback system",
          setup: "No setup required",
        },
      },
    });
  } catch (error) {
    console.error("AI providers test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "AI providers test failed",
        error: error instanceof Error ? error.message : String(error),
        fallbackAvailable: true,
      },
      { status: 500 }
    );
  }
}

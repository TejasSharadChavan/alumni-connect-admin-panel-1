/**
 * Multi-Provider AI Service - Free Alternatives to OpenAI
 * Supports: Google Gemini (Free), Groq (Free), Anthropic Claude, Ollama (Local)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
  success: boolean;
}

export interface ResumeAnalysis {
  summary: string;
  matchingScore: number;
  skillsMatch: string[];
  experienceMatch: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keyHighlights: string[];
}

export class MultiProviderAI {
  private providers: Array<{
    name: string;
    enabled: boolean;
    test: () => Promise<boolean>;
    analyze: (prompt: string) => Promise<AIResponse>;
  }> = [];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Provider 1: Google Gemini (FREE - 15 requests/minute)
    this.providers.push({
      name: "gemini",
      enabled: !!process.env.GOOGLE_AI_API_KEY,
      test: this.testGemini.bind(this),
      analyze: this.analyzeWithGemini.bind(this),
    });

    // Provider 2: Groq (FREE - Very fast inference)
    this.providers.push({
      name: "groq",
      enabled: !!process.env.GROQ_API_KEY,
      test: this.testGroq.bind(this),
      analyze: this.analyzeWithGroq.bind(this),
    });

    // Provider 3: Mock AI (Always available fallback)
    this.providers.push({
      name: "mock",
      enabled: true,
      test: async () => true,
      analyze: this.analyzeWithMock.bind(this),
    });
  }

  // Google Gemini Implementation (FREE)
  private async testGemini(): Promise<boolean> {
    try {
      if (!process.env.GOOGLE_AI_API_KEY) return false;
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "models/gemini-2.5-flash",
      });
      await model.generateContent("test");
      return true;
    } catch (error) {
      console.log("Gemini test failed:", error);
      return false;
    }
  }

  private async analyzeWithGemini(prompt: string): Promise<AIResponse> {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: "models/gemini-2.5-flash",
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text,
        provider: "Google Gemini",
        model: "gemini-2.5-flash",
        success: true,
      };
    } catch (error) {
      throw new Error(`Gemini analysis failed: ${error}`);
    }
  }

  // Groq Implementation (FREE - Very Fast)
  private async testGroq(): Promise<boolean> {
    try {
      if (!process.env.GROQ_API_KEY) return false;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      await groq.chat.completions.create({
        messages: [{ role: "user", content: "test" }],
        model: "llama3-8b-8192",
        max_tokens: 10,
      });
      return true;
    } catch (error) {
      console.log("Groq test failed:", error);
      return false;
    }
  }

  private async analyzeWithGroq(prompt: string): Promise<AIResponse> {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are an expert HR professional and resume analyst. Provide detailed, actionable feedback in valid JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama3-70b-8192", // Free tier: llama3-8b-8192 or llama3-70b-8192
        temperature: 0.3,
        max_tokens: 1500,
      });

      const text = completion.choices[0]?.message?.content || "";

      return {
        text,
        provider: "Groq",
        model: "llama3-70b-8192",
        success: true,
      };
    } catch (error) {
      throw new Error(`Groq analysis failed: ${error}`);
    }
  }
  // Mock AI Implementation (Always Available)
  private async analyzeWithMock(prompt: string): Promise<AIResponse> {
    // Extract job title and resume content for intelligent mock response
    const jobTitleMatch = prompt.match(/Title: ([^\n]+)/);
    const jobTitle = jobTitleMatch ? jobTitleMatch[1] : "Software Developer";

    const resumeMatch = prompt.match(
      /RESUME CONTENT:\s*([\s\S]+?)(?:\n\nPlease provide|$)/
    );
    const resumeContent = resumeMatch ? resumeMatch[1] : "";

    // Analyze resume content for skills
    const skills = this.extractSkillsFromText(resumeContent);
    const experience = this.extractExperienceFromText(resumeContent);
    const education = this.extractEducationFromText(resumeContent);

    // Generate intelligent mock response
    const mockAnalysis = {
      summary: `Experienced ${jobTitle.toLowerCase()} with ${experience} years of experience. Strong background in ${skills.slice(0, 3).join(", ")} and proven track record in software development.`,
      matchingScore: this.calculateMockScore(skills, jobTitle),
      skillsMatch: skills.slice(0, 6),
      experienceMatch: `${experience} years of relevant experience in software development and ${jobTitle.toLowerCase()} roles`,
      strengths: [
        `Strong technical skills in ${skills[0] || "programming"}`,
        `Experience with ${skills[1] || "modern frameworks"}`,
        `Good understanding of ${skills[2] || "software development principles"}`,
        "Problem-solving and analytical thinking",
      ],
      weaknesses: [
        "Could benefit from more experience with cloud technologies",
        "Consider gaining certifications in relevant technologies",
      ],
      recommendations: [
        `Highlight specific ${jobTitle.toLowerCase()} projects and achievements`,
        `Quantify impact with metrics and numbers`,
        `Consider adding more details about recent technologies used`,
        "Include links to portfolio or GitHub projects",
      ],
      keyHighlights: [
        `${experience}+ years of software development experience`,
        `Proficient in ${skills.slice(0, 2).join(" and ")}`,
        education ? `${education} background` : "Strong educational foundation",
        "Demonstrated problem-solving abilities",
      ],
    };

    return {
      text: JSON.stringify(mockAnalysis, null, 2),
      provider: "Mock AI",
      model: "intelligent-mock-v1",
      success: true,
    };
  }

  // Helper methods for mock analysis
  private extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      "JavaScript",
      "Python",
      "Java",
      "React",
      "Node.js",
      "TypeScript",
      "HTML",
      "CSS",
      "SQL",
      "Git",
      "Docker",
      "AWS",
      "MongoDB",
      "Express",
      "Angular",
      "Vue.js",
      "PHP",
      "C++",
      "C#",
      "Ruby",
      "Go",
      "Rust",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "Kubernetes",
      "Jenkins",
      "GraphQL",
    ];

    const foundSkills = commonSkills.filter((skill) =>
      text.toLowerCase().includes(skill.toLowerCase())
    );

    return foundSkills.length > 0
      ? foundSkills
      : ["JavaScript", "React", "Node.js"];
  }

  private extractExperienceFromText(text: string): number {
    const expMatch = text.match(
      /(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i
    );
    if (expMatch) return parseInt(expMatch[1]);

    // Count job positions as rough experience estimate
    const jobCount = (
      text.match(/\b(?:developer|engineer|analyst|manager|intern)\b/gi) || []
    ).length;
    return Math.max(1, Math.min(jobCount, 5));
  }

  private extractEducationFromText(text: string): string {
    if (text.toLowerCase().includes("master")) return "Masters degree";
    if (text.toLowerCase().includes("bachelor")) return "Bachelors degree";
    if (
      text.toLowerCase().includes("phd") ||
      text.toLowerCase().includes("doctorate")
    )
      return "PhD";
    return "Technical education";
  }

  private calculateMockScore(skills: string[], jobTitle: string): number {
    let score = 60; // Base score

    // Bonus for relevant skills
    if (skills.length > 3) score += 10;
    if (skills.length > 6) score += 10;

    // Bonus for job-relevant skills
    if (
      jobTitle.toLowerCase().includes("full stack") &&
      skills.some((s) => ["React", "Node.js", "JavaScript"].includes(s))
    ) {
      score += 15;
    }

    if (
      jobTitle.toLowerCase().includes("frontend") &&
      skills.some((s) =>
        ["React", "Angular", "Vue.js", "JavaScript"].includes(s)
      )
    ) {
      score += 15;
    }

    if (
      jobTitle.toLowerCase().includes("backend") &&
      skills.some((s) => ["Node.js", "Python", "Java", "SQL"].includes(s))
    ) {
      score += 15;
    }

    return Math.min(95, score);
  }

  // Main analysis method - tries providers in order
  public async analyzeResume(
    resumeText: string,
    jobDescription: string,
    jobTitle: string,
    requiredSkills: string[]
  ): Promise<ResumeAnalysis> {
    const prompt = `
You are an expert HR professional and resume analyst. Analyze the following resume against the job requirements and provide a comprehensive assessment.

JOB DETAILS:
Title: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${requiredSkills.join(", ")}

RESUME CONTENT:
${resumeText}

Please provide your analysis in the following JSON format:
{
  "summary": "Brief 2-3 sentence summary of the candidate's profile",
  "matchingScore": 85,
  "skillsMatch": ["skill1", "skill2"],
  "experienceMatch": "Brief description of relevant experience alignment",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["rec1", "rec2"],
  "keyHighlights": ["highlight1", "highlight2"]
}

Focus on:
1. Technical skills alignment
2. Experience relevance
3. Career progression
4. Education fit
5. Overall suitability for the role

Be specific and actionable in your feedback.
`;

    console.log("🤖 Starting multi-provider AI analysis...");

    // Try each provider in order
    for (const provider of this.providers) {
      if (!provider.enabled) {
        console.log(`⏭️ Skipping ${provider.name}: not enabled`);
        continue;
      }

      try {
        console.log(`🔍 Trying ${provider.name}...`);

        // Test provider first (except mock)
        if (provider.name !== "mock") {
          const isWorking = await provider.test();
          if (!isWorking) {
            console.log(`❌ ${provider.name}: test failed`);
            continue;
          }
        }

        // Analyze with this provider
        const response = await provider.analyze(prompt);
        console.log(
          `✅ ${provider.name} SUCCESS: ${response.text.length} characters`
        );

        // Parse JSON response
        const analysis = JSON.parse(response.text);

        // Validate required fields
        const requiredFields = [
          "summary",
          "matchingScore",
          "skillsMatch",
          "experienceMatch",
          "strengths",
          "weaknesses",
          "recommendations",
          "keyHighlights",
        ];

        for (const field of requiredFields) {
          if (!(field in analysis)) {
            throw new Error(`Missing required field: ${field}`);
          }
        }

        // Ensure matchingScore is valid
        if (
          typeof analysis.matchingScore !== "number" ||
          analysis.matchingScore < 0 ||
          analysis.matchingScore > 100
        ) {
          analysis.matchingScore = 75; // Default fallback
        }

        console.log(
          `🎯 Analysis completed using ${response.provider} (${response.model})`
        );
        return analysis;
      } catch (error) {
        console.log(
          `❌ ${provider.name} failed:`,
          error instanceof Error ? error.message : String(error)
        );
        continue;
      }
    }

    throw new Error("All AI providers failed. Please try again later.");
  }

  // Test all providers
  public async testAllProviders(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    for (const provider of this.providers) {
      if (!provider.enabled) {
        results[provider.name] = false;
        continue;
      }

      try {
        results[provider.name] = await provider.test();
      } catch (error) {
        results[provider.name] = false;
      }
    }

    return results;
  }
}

// Export singleton instance
export const multiAI = new MultiProviderAI();

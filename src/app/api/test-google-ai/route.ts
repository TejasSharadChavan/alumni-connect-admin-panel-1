import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    console.log("🧪 Testing Google AI API key...");

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    console.log("API Key present:", !!apiKey);
    console.log("API Key (first 10 chars):", apiKey?.substring(0, 10) + "...");

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Google AI API key not found in environment variables",
          apiKeyPresent: false,
        },
        { status: 400 }
      );
    }

    // Test the API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    const prompt =
      "Say 'Hello from Google Gemini AI!' and explain in one sentence what you can do for industry trend analysis.";

    console.log("🤖 Sending test prompt to Google Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log(
      "✅ Google Gemini response received:",
      text.substring(0, 100) + "..."
    );

    return NextResponse.json({
      success: true,
      message: "Google AI API key is working perfectly!",
      apiKeyPresent: true,
      apiKeyValid: true,
      model: "gemini-1.5-flash",
      testResponse: text,
      capabilities: {
        "Article Analysis": "✅ Can analyze industry articles for key insights",
        "Search Summaries": "✅ Can generate comprehensive search summaries",
        "Trend Analysis": "✅ Can identify and explain industry trends",
        "Professional Insights": "✅ Can provide actionable business insights",
        "Resume Analysis": "✅ Can enhance resume analysis with advanced AI",
      },
    });
  } catch (error) {
    console.error("Google AI test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Google AI API test failed",
        error: error instanceof Error ? error.message : String(error),
        apiKeyPresent: !!process.env.GOOGLE_AI_API_KEY,
        apiKeyValid: false,
        troubleshooting: {
          "Check API Key": "Verify the API key is correct in .env file",
          "Restart Server":
            "Restart the server to pick up new environment variables",
          "Check Quota": "Ensure you haven't exceeded the free tier limits",
          "Verify Permissions":
            "Make sure the API key has the correct permissions",
        },
      },
      { status: 500 }
    );
  }
}

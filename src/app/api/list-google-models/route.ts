import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    console.log("🔍 Listing available Google AI models...");

    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Google AI API key not found",
        },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Try different model names that are commonly available
    const modelsToTest = [
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.0-pro",
      "text-bison-001",
      "chat-bison-001",
    ];

    const availableModels = [];
    const failedModels = [];

    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Try a simple generation to test if the model works
        const result = await model.generateContent("Hello");
        const response = await result.response;
        const text = response.text();

        availableModels.push({
          name: modelName,
          status: "✅ Available",
          testResponse: text.substring(0, 50) + "...",
        });

        console.log(`✅ ${modelName} works`);
      } catch (error) {
        failedModels.push({
          name: modelName,
          status: "❌ Failed",
          error: error instanceof Error ? error.message : String(error),
        });

        console.log(
          `❌ ${modelName} failed:`,
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Found ${availableModels.length} working models`,
      availableModels,
      failedModels,
      recommendation:
        availableModels.length > 0
          ? `Use model: ${availableModels[0].name}`
          : "No working models found - check API key permissions",
    });
  } catch (error) {
    console.error("Model listing failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to list models",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: "Google AI API key not found",
        troubleshooting: "Add GOOGLE_AI_API_KEY to your .env file",
      });
    }

    console.log("🔍 Debugging Google AI API key...");
    console.log(
      "API Key format:",
      apiKey.startsWith("AIza")
        ? "✅ Correct format (AIza...)"
        : "❌ Wrong format"
    );
    console.log("API Key length:", apiKey.length);

    // Try to call the API directly to see what happens
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log("🌐 Testing direct API call to list models...");
    const response = await fetch(testUrl);

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText);

      return NextResponse.json(
        {
          success: false,
          message: "Google AI API call failed",
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          troubleshooting: {
            "API Key Issues": [
              "Make sure you created the API key at https://aistudio.google.com/app/apikey",
              "Ensure the API key has the correct permissions",
              "Check if the Generative Language API is enabled",
              "Verify you're not exceeding rate limits",
            ],
            "Common Solutions": [
              "Try creating a new API key",
              "Make sure you're using Google AI Studio (not Google Cloud)",
              "Check if your account has access to Gemini models",
            ],
          },
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ API call successful:", data);

    return NextResponse.json({
      success: true,
      message: "Google AI API key is working!",
      availableModels:
        data.models?.map((model: any) => ({
          name: model.name,
          displayName: model.displayName,
          description: model.description,
          supportedGenerationMethods: model.supportedGenerationMethods,
        })) || [],
      apiKeyValid: true,
      recommendation:
        data.models?.length > 0
          ? `Use model: ${data.models[0].name}`
          : "No models found",
    });
  } catch (error) {
    console.error("Debug failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Debug failed",
        error: error instanceof Error ? error.message : String(error),
        troubleshooting: {
          "Network Issues": [
            "Check your internet connection",
            "Verify firewall settings",
            "Try again in a few minutes",
          ],
          "API Key Issues": [
            "Recreate your API key at https://aistudio.google.com/app/apikey",
            "Make sure the API key is correctly copied",
            "Check if the Generative Language API is enabled",
          ],
        },
      },
      { status: 500 }
    );
  }
}

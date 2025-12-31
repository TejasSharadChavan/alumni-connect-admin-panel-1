import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    console.log("🧪 Testing OpenAI API connection...");
    console.log(
      "API Key (first 20 chars):",
      process.env.OPENAI_API_KEY?.substring(0, 20) + "..."
    );

    // Simple test call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: "Say 'Hello, OpenAI API is working!' in exactly 5 words.",
        },
      ],
      max_tokens: 20,
      temperature: 0,
    });

    const response = completion.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      message: "OpenAI API is working correctly!",
      response: response,
      model: completion.model,
      usage: completion.usage,
    });
  } catch (error) {
    console.error("OpenAI API test failed:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: "OpenAI API test failed",
          error: error.message,
          apiKeyPresent: !!process.env.OPENAI_API_KEY,
          apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing job details API...");

    // Get the first job from the database
    const firstJob = await db
      .select()
      .from(jobs)
      .orderBy(desc(jobs.id))
      .limit(1);

    if (firstJob.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No jobs found in database",
        message: "Please create some jobs first",
      });
    }

    const job = firstJob[0];
    console.log("Found test job:", job.title, "with ID:", job.id);

    // Test the job details API
    const testUrl = `${request.nextUrl.origin}/api/jobs/${job.id}`;
    console.log("Testing URL:", testUrl);

    const response = await fetch(testUrl, {
      headers: {
        Authorization: request.headers.get("Authorization") || "",
      },
    });

    const data = await response.json();
    console.log("API response:", data);

    return NextResponse.json({
      success: true,
      message: "Job details API test completed",
      testJobId: job.id,
      testJobTitle: job.title,
      apiResponse: data,
      apiStatus: response.status,
      testUrl: testUrl,
    });
  } catch (error) {
    console.error("Job details API test failed:", error);
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

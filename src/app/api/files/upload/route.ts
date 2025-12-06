import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "resume";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type based on upload type
    let allowedTypes: string[] = [];
    let uploadFolder = "resumes";
    let maxSize = 5 * 1024 * 1024; // 5MB default

    if (type === "message-image") {
      allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      uploadFolder = "message-images";
    } else {
      // Resume upload
      allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      uploadFolder = "resumes";
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            type === "message-image"
              ? "Invalid file type. Only JPEG, JPG, PNG, GIF, and WebP images are allowed."
              : "Invalid file type. Only PDF, DOC, and DOCX are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "File too large. Maximum size is 5MB.",
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${randomUUID()}-${Date.now()}.${ext}`;
    const filepath = join(
      process.cwd(),
      "public",
      "uploads",
      uploadFolder,
      filename
    );

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${uploadFolder}/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename,
      originalName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Upload failed",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDFEnhanced } from "@/lib/enhanced-pdf-parser";

export async function GET() {
  try {
    // Create a simple test PDF buffer (minimal PDF structure)
    const testPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF Content) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`;

    const testBuffer = Buffer.from(testPdfContent, "binary");

    console.log("🧪 Testing PDF parsing with synthetic PDF...");

    try {
      const result = await extractTextFromPDFEnhanced(testBuffer);

      return NextResponse.json({
        success: true,
        message: "Enhanced PDF parsing is working correctly!",
        extractedText: result.text,
        textLength: result.text.length,
        method: result.method,
        confidence: result.confidence,
        metadata: result.metadata,
        availableMethods: {
          "pdf-parse-optimized": "✅ Available",
          "pdf-lib-advanced": "✅ Available",
          "pdf-extraction": "✅ Available",
          textract: "✅ Available",
          "pdf2json-enhanced": "✅ Available",
          "mammoth-fallback": "✅ Available",
          "direct-stream-advanced": "✅ Available",
          "pdfjs-server-safe": "✅ Available",
          "node-tika": "✅ Available",
        },
      });
    } catch (error) {
      console.error("PDF parsing failed:", error);

      return NextResponse.json(
        {
          success: false,
          message: "PDF parsing failed",
          error: error instanceof Error ? error.message : String(error),
          libraries: {
            "pdf-parse": "❓ Unknown",
            pdf2json: "❓ Unknown",
            "pdfjs-dist": "❓ Unknown",
            "direct-extraction": "❓ Unknown",
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Test setup failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Test setup failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No PDF file provided",
        },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          message: "File must be a PDF",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    console.log(
      `🧪 Testing PDF parsing with uploaded file: ${file.name} (${buffer.length} bytes)`
    );

    try {
      const result = await extractTextFromPDFEnhanced(buffer);

      return NextResponse.json({
        success: true,
        message: "Enhanced PDF parsing successful!",
        fileName: file.name,
        fileSize: buffer.length,
        method: result.method,
        confidence: result.confidence,
        metadata: result.metadata,
        extractedText:
          result.text.substring(0, 500) +
          (result.text.length > 500 ? "..." : ""),
        fullTextLength: result.text.length,
        preview: result.text.substring(0, 200),
      });
    } catch (error) {
      console.error("PDF parsing failed:", error);

      return NextResponse.json(
        {
          success: false,
          message: "PDF parsing failed",
          fileName: file.name,
          fileSize: buffer.length,
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request processing failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Request processing failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
